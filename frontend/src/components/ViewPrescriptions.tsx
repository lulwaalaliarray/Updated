import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { prescriptionStorage } from '../utils/prescriptionStorage';

import { Prescription } from '../utils/prescriptionStorage';

const ViewPrescriptions: React.FC = () => {
  const { showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        showToast('Please log in to view prescriptions', 'error');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user.email;
      
      const userPrescriptions = prescriptionStorage.getPatientPrescriptionsWithExpiration(userId);
      setPrescriptions(userPrescriptions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      showToast('Error loading prescriptions', 'error');
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filterStatus === 'all') return true;
    return prescription.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { bg: '#dcfce7', color: '#059669' };
      case 'completed':
        return { bg: '#dbeafe', color: '#2563eb' };
      case 'expired':
        return { bg: '#fee2e2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const handlePrintPrescription = (prescription: Prescription) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to print prescriptions', 'error');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescription.patientName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0d9488;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              color: #0d9488;
              margin-bottom: 5px;
            }
            .clinic-info {
              color: #666;
              font-size: 14px;
            }
            .prescription-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
            }
            .info-label {
              font-weight: bold;
              color: #374151;
              margin-bottom: 5px;
            }
            .medications {
              margin-bottom: 30px;
            }
            .medication-item {
              background: #f0fdfa;
              border: 1px solid #0d9488;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
            }
            .medication-name {
              font-size: 18px;
              font-weight: bold;
              color: #0d9488;
              margin-bottom: 10px;
            }
            .medication-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              font-size: 14px;
            }
            .diagnosis-section {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .footer {
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .signature-section {
              margin-top: 40px;
              text-align: right;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              width: 200px;
              margin: 20px 0 5px auto;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">PatientCare Medical Center</div>
            <div class="clinic-info">
              📍 Manama, Kingdom of Bahrain | 📞 +973 1234 5678 | 📧 info@patientcare.bh
            </div>
          </div>

          <div class="prescription-info">
            <div class="info-section">
              <div class="info-label">Patient Information</div>
              <div><strong>Name:</strong> ${prescription.patientName}</div>
              <div><strong>Email:</strong> ${prescription.patientEmail}</div>
              <div><strong>Date:</strong> ${new Date(prescription.dateIssued).toLocaleDateString()}</div>
            </div>
            <div class="info-section">
              <div class="info-label">Prescribing Doctor</div>
              <div><strong>Doctor:</strong> Dr. ${prescription.doctorName}</div>
              <div><strong>Prescription ID:</strong> ${prescription.id}</div>
              <div><strong>Status:</strong> ${prescription.status.toUpperCase()}</div>
            </div>
          </div>

          ${prescription.diagnosis ? `
            <div class="diagnosis-section">
              <div class="info-label">Diagnosis</div>
              <div>${prescription.diagnosis}</div>
            </div>
          ` : ''}

          <div class="medications">
            <h3 style="color: #0d9488; margin-bottom: 20px;">Prescribed Medications</h3>
            ${prescription.medications.map((med, index) => `
              <div class="medication-item">
                <div class="medication-name">${index + 1}. ${med.name}</div>
                <div class="medication-details">
                  <div><strong>Dosage:</strong> ${med.dosage}</div>
                  <div><strong>Frequency:</strong> ${med.frequency}</div>
                  <div><strong>Duration:</strong> ${med.duration}</div>
                  <div><strong>Instructions:</strong> ${med.instructions}</div>
                </div>
              </div>
            `).join('')}
          </div>

          ${prescription.notes ? `
            <div class="info-section">
              <div class="info-label">Additional Notes</div>
              <div>${prescription.notes}</div>
            </div>
          ` : ''}

          <div class="signature-section">
            <div>Doctor's Signature</div>
            <div class="signature-line"></div>
            <div style="margin-top: 5px;">Dr. ${prescription.doctorName}</div>
          </div>

          <div class="footer">
            <p><strong>Important:</strong> This prescription is valid for medical use only. Please follow the prescribed dosage and consult your doctor if you experience any side effects.</p>
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #0d9488',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading prescriptions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              My Prescriptions
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280'
            }}>
              View and manage your medical prescriptions
            </p>
          </div>

          {/* Filter Buttons */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['all', 'active', 'completed', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: filterStatus === status ? '#0d9488' : 'white',
                  color: filterStatus === status ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (filterStatus !== status) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterStatus !== status) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {status} ({status === 'all' ? prescriptions.length : prescriptions.filter(p => p.status === status).length})
              </button>
            ))}
          </div>

          {/* Prescriptions List */}
          {filteredPrescriptions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No prescriptions found
              </h3>
              <p>You don't have any prescriptions matching the selected filter.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {filteredPrescriptions.map((prescription) => {
                const statusStyle = getStatusColor(prescription.status);
                return (
                  <div
                    key={prescription.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedPrescription(prescription)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0d9488';
                      e.currentTarget.style.backgroundColor = '#f0fdfa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {prescription.medications[0]?.name || 'Prescription'}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 4px 0'
                        }}>
                          Prescribed by Dr. {prescription.doctorName}
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {prescription.medications[0]?.dosage} - {prescription.medications[0]?.frequency}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          textTransform: 'capitalize'
                        }}>
                          {prescription.status}
                        </span>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: '8px 0 0 0'
                        }}>
                          Issued: {new Date(prescription.dateIssued).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      marginTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#374151',
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          Duration: {prescription.medications[0]?.duration}
                        </p>
                        {prescription.medications[0]?.instructions && (
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '4px 0 0 0'
                          }}>
                            Instructions: {prescription.medications[0]?.instructions}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintPrescription(prescription);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#0d9488',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#0f766e';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0d9488';
                        }}
                      >
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                        </svg>
                        Print
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Prescription Details
              </h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Medications
                </label>
                {selectedPrescription.medications.map((med, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#f8fafc', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    margin: '8px 0' 
                  }}>
                    <p style={{ fontSize: '16px', color: '#111827', margin: '0 0 8px 0', fontWeight: '600' }}>
                      {med.name}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                      <p style={{ margin: 0, color: '#6b7280' }}>Dosage: {med.dosage}</p>
                      <p style={{ margin: 0, color: '#6b7280' }}>Frequency: {med.frequency}</p>
                      <p style={{ margin: 0, color: '#6b7280' }}>Duration: {med.duration}</p>
                      <p style={{ margin: 0, color: '#6b7280' }}>Instructions: {med.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Diagnosis
                </label>
                <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedPrescription.diagnosis || 'No diagnosis provided'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Prescribed by
                  </label>
                  <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                    Dr. {selectedPrescription.doctorName}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Date Issued
                  </label>
                  <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                    {new Date(selectedPrescription.dateIssued).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Additional Notes
                  </label>
                  <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: getStatusColor(selectedPrescription.status).bg,
                      color: getStatusColor(selectedPrescription.status).color,
                      textTransform: 'capitalize'
                    }}>
                      {selectedPrescription.status}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      Status
                    </span>
                  </div>
                  <button
                    onClick={() => handlePrintPrescription(selectedPrescription)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0d9488';
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                    </svg>
                    Print Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ViewPrescriptions;