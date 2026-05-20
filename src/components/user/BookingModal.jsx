import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MessageSquare, Loader2, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import FileAttachZone from '../common/FileAttachZone';
import { appointmentService } from '../../services/appointmentService';
import { petService } from '../../services/petService';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const BookingModal = ({ isOpen, onClose, onBookingSuccess }) => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [formData, setFormData] = useState({
    doctor_id: '',
    pet_id: '',
    date: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [docsData, petsData] = await Promise.all([
        appointmentService.getDoctors(),
        petService.getPets()
      ]);
      setDoctors(docsData || []);
      setPets(petsData || []);
      
      if (petsData?.length > 0) {
        setFormData(prev => ({ ...prev, pet_id: petsData[0].id }));
      }
    } catch (error) {
      console.error("Failed to load booking data:", error);
      toast.error("Failed to load required information");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (files) => {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setUploadProgress(`Uploading file ${i + 1} of ${files.length}…`);
      const ext = f.name.split('.').pop();
      const path = `appointments/${Date.now()}_${i}.${ext}`;
      
      const { error } = await supabase.storage.from('medical-files').upload(path, f);
      
      if (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${f.name}`);
        continue;
      }
      
      const { data: urlData } = supabase.storage.from('medical-files').getPublicUrl(path);
      urls.push({ 
        name: f.name, 
        url: urlData.publicUrl, 
        size: f.size, 
        type: f.type 
      });
    }
    setUploadProgress('');
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      let fileRecords = [];
      if (attachedFiles.length > 0) {
        fileRecords = await uploadFiles(attachedFiles);
      }

      const payload = {
        doctor_id: formData.doctor_id || null,
        pet_id: formData.pet_id,
        date: formData.date,
        notes: formData.notes,
        files: fileRecords,
        status: 'pending'
      };

      await appointmentService.createAppointment(payload);
      
      toast.success("Appointment requested successfully!");
      onBookingSuccess();
      handleClose();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ doctor_id: '', pet_id: '', date: '', notes: '' });
    setAttachedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-start bg-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="mt-1">
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">{t('booking.title')}</h2>
              <p className="text-sm text-zinc-500 font-medium mt-1">{t('booking.subtitle')}</p>
            </div>
            <button onClick={handleClose} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 mt-1">
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-emerald-500" size={36} />
                  <p className="text-zinc-500 font-medium">Preparing booking form...</p>
                </div>
              ) : (
                <>
                  {/* Pet Selection */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 ml-1 flex items-center justify-between">
                      <span>{t('booking.form.select_pet')} <span className="text-emerald-500">*</span></span>
                    </label>
                    <div className="relative group">
                      <select 
                        required
                        value={formData.pet_id}
                        onChange={(e) => setFormData({...formData, pet_id: e.target.value})}
                        className="w-full pl-11 pr-10 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none bg-white shadow-sm appearance-none hover:border-zinc-300 cursor-pointer font-medium text-zinc-800"
                      >
                        <option value="" disabled>{t('booking.form.select_pet')}</option>
                        {pets.map(pet => (
                          <option key={pet.id} value={pet.id}>{pet.name} ({pet.type})</option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">P</span>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Selection */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 ml-1">
                      {t('booking.form.select_doctor')} <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <select 
                        value={formData.doctor_id}
                        onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                        className="w-full pl-11 pr-10 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none bg-white shadow-sm appearance-none hover:border-zinc-300 cursor-pointer font-medium text-zinc-800"
                      >
                        <option value="">Any Available Doctor</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>Dr. {doc.full_name}</option>
                        ))}
                      </select>
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date/Time */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 ml-1">
                      {t('booking.form.date')} <span className="text-emerald-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="datetime-local"
                        required
                        min={new Date().toISOString().slice(0, 16)}
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none bg-white shadow-sm hover:border-zinc-300 font-medium text-zinc-800"
                      />
                      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Reason/Notes */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-zinc-700 ml-1">
                      {t('booking.form.reason')}
                    </label>
                    <div className="relative">
                      <textarea 
                        rows={3}
                        placeholder={t('booking.form.reason_placeholder') || "Describe the symptoms or reason for your visit..."}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none bg-white shadow-sm resize-none hover:border-zinc-300 font-medium text-zinc-800"
                      />
                      <MessageSquare size={18} className="absolute left-4 top-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* File Attachment */}
                  <div className="space-y-2 pt-1 border-t border-zinc-100">
                    <label className="text-sm font-semibold text-zinc-700 ml-1 mt-2 block">
                      Attach Medical Records or Images <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <FileAttachZone 
                      files={attachedFiles}
                      onAdd={(newFiles) => setAttachedFiles(prev => [...prev, ...newFiles])}
                      onRemove={(index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                    />
                    <p className="text-[11px] text-zinc-500 ml-1">PDF, JPG, PNG or DOC — Max 10MB each</p>
                  </div>

                  {/* Progress Indicator */}
                  {uploadProgress && (
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 animate-pulse">
                      <Loader2 size={16} className="animate-spin" />
                      {uploadProgress}
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
          
          {/* Actions - Sticky at bottom */}
          {!isLoading && (
            <div className="p-6 bg-zinc-50 border-t border-zinc-100 shrink-0 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 font-semibold"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('booking.form.cancel')}
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                className="flex-[2] font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                isLoading={isSubmitting}
              >
                {t('booking.form.book')}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;

