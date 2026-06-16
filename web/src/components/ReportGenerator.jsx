import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { jsPDF } from 'jspdf';
import { 
  FileText, Download, Play, RefreshCw, Layers, MapPin, 
  TrendingUp, Compass, AlertTriangle
} from 'lucide-react';

/**
 * ReportGenerator Component (Feature 3 - Updated layout for structured JSON reports)
 * Renders report configuration forms, calls Groq AI backend, and exports PDF using jsPDF.
 */
export function ReportGenerator() {
  const [reportType, setReportType] = useState('DISTRICT'); // DISTRICT, STATE, COMPARATIVE, TREND
  
  // Selection Options (Loaded on mount)
  const [states, setStates] = useState([]);
  const [years, setYears] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // Form values
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [compareDistrict, setCompareDistrict] = useState('');
  const [compareState, setCompareState] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  // Mount logic: fetch metadata values to populate dropdowns
  const fetchMetadata = async () => {
    try {
      const stats = await apiService.getStatistics();
      if (stats.success && stats.data) {
        setStates(stats.data.availableStates || []);
        setYears(stats.data.availableYears || []);
        
        // Also extract all districts mapping for quick lookups
        const allDists = stats.data.districtWiseData || [];
        setDistricts(allDists.map(item => item.district) || []);

        if (stats.data.availableStates?.length > 0) {
          setSelectedState(stats.data.availableStates[0]);
          setCompareState(stats.data.availableStates.length > 1 ? stats.data.availableStates[1] : stats.data.availableStates[0]);
        }
        if (stats.data.availableYears?.length > 0) {
          setSelectedYear(stats.data.availableYears[0]);
        }
        if (allDists.length > 0) {
          setSelectedDistrict(allDists[0].district);
          setCompareDistrict(allDists.length > 1 ? allDists[1].district : allDists[0].district);
        }
      }
    } catch (err) {
      console.error('Failed to load report metadata:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch districts list when state changes
  useEffect(() => {
    if (selectedState) {
      apiService.getStatistics({ state: selectedState }).then(res => {
        if (res.success && res.data?.districtWiseData) {
          const list = res.data.districtWiseData.map(d => d.district);
          setDistricts(list);
          if (list.length > 0) {
            setSelectedDistrict(list[0]);
          }
        }
      });
    }
  }, [selectedState]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    setError('');
    
    // Simulate compilation steps for better UX
    setLoadingMessage('Aggregating regional parameters...');
    setTimeout(() => {
      setLoadingMessage('Structuring hydrogeological prompt data...');
    }, 1200);
    setTimeout(() => {
      setLoadingMessage('Generating analysis with Groq LLM...');
    }, 2400);

    try {
      const request = {
        reportType,
        district: selectedDistrict,
        state: selectedState,
        year: parseInt(selectedYear),
        compareDistrict,
        compareState
      };

      const result = await apiService.generateReport(request);
      if (result.success && result.data) {
        setReportData(result.data);
      } else {
        setError('Failed to generate report from AI.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the report generator endpoint.');
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF using jsPDF (paginated, clean rendering)
  const handleDownloadPDF = () => {
    if (!reportData) return;

    // Construct unified report text from structured sections
    const reportText = [
      `# ${reportData.title || 'Groundwater Assessment Report'}`,
      `## 1. EXECUTIVE SUMMARY`,
      reportData.executiveSummary || '',
      `## 2. GROUNDWATER STATISTICS`,
      reportData.statistics || '',
      `## 3. STRESS ANALYSIS & FINDINGS`,
      reportData.findings || '',
      `## 4. RECOMMENDATIONS`,
      reportData.recommendations || '',
      `## 5. CONCLUSION`,
      reportData.conclusion || ''
    ].join('\n\n');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    let y = margin;

    // Report Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 118, 110); // Teal accent
    doc.text("Groundwater Assessment Report", margin, y);
    y += 8;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Report Type: ${reportType} | Date Generated: ${new Date().toLocaleDateString()}`, margin, y);
    y += 5;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Process markdown string line by line
    const lines = reportText.split('\n');
    
    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) {
        y += 4;
        return;
      }

      if (cleanLine.startsWith('#')) {
        // Section Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 118, 110); // Teal heading
        
        const headingText = cleanLine.replace(/#/g, '').trim();
        const splitHeading = doc.splitTextToSize(headingText, contentWidth);
        
        splitHeading.forEach(h => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(h, margin, y);
          y += 6;
        });
        y += 2; // Extra padding below headings
      } else {
        // Body text
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        const isBullet = cleanLine.startsWith('-') || cleanLine.startsWith('*');
        let text = cleanLine;
        if (isBullet) {
          text = "•  " + cleanLine.replace(/^[-*]\s*/, '');
        }

        const indent = isBullet ? margin + 4 : margin;
        const widthLimit = isBullet ? contentWidth - 4 : contentWidth;

        const splitParagraph = doc.splitTextToSize(text, widthLimit);
        splitParagraph.forEach(l => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(l, indent, y);
          y += 5.5;
        });
      }
    });

    // Save triggers download
    doc.save(`groundwater_${reportType.toLowerCase()}_report.pdf`);
  };

  const renderMarkdownPreview = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="md-h4">{trimmed.replace('###', '').trim()}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} className="md-h3">{trimmed.replace('##', '').trim()}</h3>;
      }
      if (trimmed.startsWith('#')) {
        return <h2 key={idx} className="md-h2">{trimmed.replace('#', '').trim()}</h2>;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="md-li">
            <span className="bullet-point"></span>
            <span>{trimmed.replace(/^[-*]\s*/, '').trim()}</span>
          </li>
        );
      }
      if (trimmed.match(/^\d+\./)) {
        return (
          <li key={idx} className="md-li-numbered">
            <span className="number-point">{trimmed.match(/^\d+/)[0]}.</span>
            <span>{trimmed.replace(/^\d+\.\s*/, '').trim()}</span>
          </li>
        );
      }
      if (trimmed === '') return <div key={idx} style={{ height: '8px' }}></div>;
      return <p key={idx} className="md-p">{trimmed}</p>;
    });
  };

  const renderReportContent = (report) => {
    if (!report) return null;
    return (
      <div className="report-structured-preview">
        <h2 className="report-title-main" style={{ color: '#0f766e', fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
          {report.title}
        </h2>
        
        <div className="report-section glass-card" style={{ padding: '16px', marginBottom: '16px', borderLeft: '4px solid #0f766e' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f766e', marginBottom: '10px' }}>1. EXECUTIVE SUMMARY</h3>
          <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
            {renderMarkdownPreview(report.executiveSummary)}
          </div>
        </div>

        <div className="report-section glass-card" style={{ padding: '16px', marginBottom: '16px', borderLeft: '4px solid #0f766e' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f766e', marginBottom: '10px' }}>2. GROUNDWATER STATISTICS</h3>
          <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
            {renderMarkdownPreview(report.statistics)}
          </div>
        </div>

        <div className="report-section glass-card" style={{ padding: '16px', marginBottom: '16px', borderLeft: '4px solid #0f766e' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f766e', marginBottom: '10px' }}>3. STRESS ANALYSIS & FINDINGS</h3>
          <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
            {renderMarkdownPreview(report.findings)}
          </div>
        </div>

        <div className="report-section glass-card" style={{ padding: '16px', marginBottom: '16px', borderLeft: '4px solid #0f766e' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f766e', marginBottom: '10px' }}>4. RECOMMENDATIONS</h3>
          <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
            {renderMarkdownPreview(report.recommendations)}
          </div>
        </div>

        <div className="report-section glass-card" style={{ padding: '16px', marginBottom: '8px', borderLeft: '4px solid #0f766e' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f766e', marginBottom: '10px' }}>5. CONCLUSION</h3>
          <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
            {renderMarkdownPreview(report.conclusion)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container report-generator-page">
      <div className="page-header">
        <div className="header-title-wrapper">
          <FileText className="header-icon" size={24} />
          <h1>AI Report Generator</h1>
        </div>
        <p className="header-subtitle">
          Generate professional, customized reports powered by Groq LLM.
        </p>
      </div>

      {/* Report Selector Tabs */}
      <div className="report-tabs glass-card">
        <button 
          onClick={() => setReportType('DISTRICT')}
          className={`report-tab ${reportType === 'DISTRICT' ? 'active' : ''}`}
        >
          <MapPin size={15} />
          <span>District Report</span>
        </button>
        <button 
          onClick={() => setReportType('STATE')}
          className={`report-tab ${reportType === 'STATE' ? 'active' : ''}`}
        >
          <Layers size={15} />
          <span>State Report</span>
        </button>
        <button 
          onClick={() => setReportType('COMPARATIVE')}
          className={`report-tab ${reportType === 'COMPARATIVE' ? 'active' : ''}`}
        >
          <Compass size={15} />
          <span>Comparative Report</span>
        </button>
        <button 
          onClick={() => setReportType('TREND')}
          className={`report-tab ${reportType === 'TREND' ? 'active' : ''}`}
        >
          <TrendingUp size={15} />
          <span>Trend Analysis</span>
        </button>
      </div>

      {/* Filter Options based on Selection */}
      <div className="report-config glass-card">
        <div className="filters-grid">
          {reportType === 'DISTRICT' && (
            <>
              <div className="filter-group">
                <label>State</label>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="filter-select">
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="filter-select">
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Assessment Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="filter-select">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {reportType === 'STATE' && (
            <>
              <div className="filter-group">
                <label>State</label>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="filter-select">
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Assessment Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="filter-select">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {reportType === 'COMPARATIVE' && (
            <>
              <div className="filter-group">
                <label>Primary State</label>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="filter-select">
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Primary District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="filter-select">
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="filter-group flex-spacer"></div>
              
              <div className="filter-group">
                <label>Comparison State</label>
                <select value={compareState} onChange={(e) => setCompareState(e.target.value)} className="filter-select">
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Comparison District</label>
                <select value={compareDistrict} onChange={(e) => setCompareDistrict(e.target.value)} className="filter-select">
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Assessment Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="filter-select">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {reportType === 'TREND' && (
            <>
              <div className="filter-group">
                <label>State</label>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="filter-select">
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="filter-select">
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="button-group">
          <button 
            onClick={handleGenerateReport} 
            disabled={loading} 
            className="generate-btn"
          >
            <Play size={15} />
            <span>Generate AI Report</span>
          </button>
        </div>
      </div>

      {/* Report Output Area */}
      {loading ? (
        <div className="report-loader glass-card">
          <div className="spinner"></div>
          <p className="loading-message">{loadingMessage}</p>
        </div>
      ) : error ? (
        <div className="report-error glass-card">
          <AlertTriangle size={32} className="error-icon" />
          <p>{error}</p>
          <button onClick={handleGenerateReport} className="retry-btn">Retry Report Generation</button>
        </div>
      ) : reportData ? (
        <div className="report-preview glass-card">
          <div className="preview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Report Preview</h3>
            <button onClick={handleDownloadPDF} className="download-pdf-btn">
              <Download size={14} />
              <span>Download PDF</span>
            </button>
          </div>
          <hr className="preview-divider" />
          <div className="preview-content">
            {renderReportContent(reportData)}
          </div>
        </div>
      ) : (
        <div className="report-placeholder glass-card">
          <FileText size={48} className="placeholder-icon" />
          <p>Configure parameters above and click "Generate AI Report" to create a groundwater assessment summary.</p>
        </div>
      )}
    </div>
  );
}

export default ReportGenerator;
