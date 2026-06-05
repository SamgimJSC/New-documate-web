import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMockAnalysisResults, createMockUploadFiles, uploadCategoryGuide } from '../../data/uploadCategories';
import type { UploadAnalysisResult, UploadDocumentCategory } from '../../types/upload';
import './UploadPage.css';

const initialFileNames = [
  '영수증_스타벅스.jpg',
  '임대차계약서.png',
  '보증서_노트북.jpg',
];

const statusLabel = {
  대기: '분석 대기 중',
  분석중: 'AI 분석 중',
  완료: '분류 완료',
  오류: '오류',
};

export function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedResultId, setSelectedResultId] = useState(1);
  const [results, setResults] = useState<UploadAnalysisResult[]>(() =>
    createMockAnalysisResults(createMockUploadFiles(initialFileNames)),
  );

  const uploadFiles = useMemo(() => createMockUploadFiles(initialFileNames), []);
  const selectedResult = results.find((result) => result.id === selectedResultId) ?? results[0];

  const handleCategoryChange = (category: UploadDocumentCategory) => {
    const confirmed = window.confirm(
      '카테고리를 바꾸면 추출 항목이 달라져 기존 입력값이 초기화됩니다. 변경할까요?',
    );

    if (!confirmed) {
      return;
    }

    const guide = uploadCategoryGuide.find((item) => item.category === category);

    setResults((prevResults) =>
      prevResults.map((result) =>
        result.id === selectedResult.id
          ? {
              ...result,
              category,
              isReceipt: category === '영수증',
              fields:
                guide?.extractedData
                  .split(', ')
                  .map((label) => ({ label, value: '' })) ?? [],
            }
          : result,
      ),
    );
  };

  const handleSave = () => {
    if (selectedResult.isReceipt) {
      alert('영수증으로 분류된 문서가 있습니다. 영수증 관리 페이지에서 별도로 확인해주세요.');
      navigate('/receipts');
      return;
    }

    alert('디지털 캐비닛에 저장되었습니다.');
    navigate('/documents');
  };

  const movePrev = () => {
    setSelectedResultId((current) => Math.max(1, current - 1));
  };

  const moveNext = () => {
    setSelectedResultId((current) => Math.min(results.length, current + 1));
  };

  return (
    <section className="documate-upload-page">
      <header className="upload-page-header">
        <button type="button" className="upload-back-button" onClick={() => navigate('/documents')}>
          ‹ 디지털 캐비닛
        </button>
        <div>
          <p className="eyebrow">DocuMate · 업로드</p>
          <h1>문서 업로드</h1>
          <p>JPG / PNG 이미지를 업로드하면 AI가 문서 종류를 분석하고 저장 위치를 자동으로 분기합니다.</p>
        </div>
      </header>

      <div className="upload-step-card">
        <button
          type="button"
          className={step === 1 ? 'step-pill active' : 'step-pill'}
          onClick={() => setStep(1)}
        >
          <span>01</span>
          새 문서 업로드
        </button>
        <div className="step-line" />
        <button
          type="button"
          className={step === 2 ? 'step-pill active' : 'step-pill'}
          onClick={() => setStep(2)}
        >
          <span>02</span>
          추출 정보 확인·등록
        </button>
      </div>

      {step === 1 ? (
        <div className="upload-workspace">
          <main className="upload-card primary">
            <div className="upload-card-title">
              <div>
                <span className="section-number">①</span>
                <h2>새 문서 업로드</h2>
                <p>파일을 올리면 자동 분석이 시작됩니다. 분석이 끝나면 정보 확인 단계로 이동합니다.</p>
              </div>
              <button type="button" onClick={() => setStep(2)}>분석 결과 확인</button>
            </div>

            <label className="figma-upload-zone">
              <input type="file" accept="image/png,image/jpeg" multiple />
              <div className="upload-arrow">↑</div>
              <strong>파일을 여기에 드래그하세요</strong>
              <small>또는 클릭해서 파일 선택</small>
            </label>

            <div className="upload-file-list">
              <div className="list-heading">
                <strong>업로드 ({uploadFiles.length})</strong>
                <span>JPG · PNG / 10MB / 최대 10장</span>
              </div>

              {uploadFiles.map((file) => (
                <article key={file.id} className="figma-file-row">
                  <div className="file-icon">IMG</div>
                  <div className="file-meta">
                    <strong>{file.fileName}</strong>
                    <span>{file.sizeMb} MB · {statusLabel[file.status]}</span>
                    <div className="progress-track">
                      <i style={{ width: `${file.progress}%` }} />
                    </div>
                  </div>
                  <span className={file.status === '완료' ? 'status complete' : 'status loading'}>
                    {file.status === '완료' ? '완료' : '분석중'}
                  </span>
                </article>
              ))}
            </div>
          </main>

          <aside className="upload-info-stack">
            <section className="upload-card compact">
              <h3>업로드 안내</h3>
              <ul>
                <li>지원 형식: JPG, PNG</li>
                <li>PDF 업로드 제외</li>
                <li>장당 최대 10MB</li>
                <li>한 번에 최대 10장</li>
                <li>업로드 즉시 AI 분석 시작</li>
              </ul>
            </section>

            <section className="upload-card compact">
              <h3>분류 카테고리</h3>
              <p>AI가 문서 종류를 자동 분류합니다.</p>
              <div className="upload-category-grid">
                {uploadCategoryGuide.map((guide) => (
                  <span key={guide.category}>{guide.category}</span>
                ))}
              </div>
            </section>

            <section className="upload-card compact dark">
              <h3>저장 분기</h3>
              <p>계약서·보증서·처방전 등은 디지털 캐비닛으로, 영수증은 영수증 관리로 이동합니다.</p>
            </section>
          </aside>
        </div>
      ) : (
        <div className="analysis-workspace">
          <main className="upload-card preview">
            <div className="upload-card-title">
              <div>
                <span className="section-number">②</span>
                <h2>추출 정보 확인·등록</h2>
                <p>AI가 채운 정보를 확인하고, 그대로 저장하거나 직접 수정하세요.</p>
              </div>
              <div className="document-counter">
                <button type="button" onClick={movePrev}>‹</button>
                <span>문서 {selectedResult.id} / {results.length}</span>
                <button type="button" onClick={moveNext}>›</button>
              </div>
            </div>

            <div className="figma-preview-box">
              <div className="preview-mountain" />
              <div>
                <span>미리보기</span>
                <strong>{selectedResult.fileName}</strong>
              </div>
            </div>

            <div className="preview-helper">
              <span>미리보기에서 마스킹할 영역을 드래그로 지정할 수 있습니다.</span>
            </div>
          </main>

          <aside className="upload-card analysis-form">
            <label className="form-label">
              AI 판단 카테고리
              <select
                value={selectedResult.category}
                onChange={(event) => handleCategoryChange(event.target.value as UploadDocumentCategory)}
              >
                {uploadCategoryGuide.map((guide) => (
                  <option key={guide.category} value={guide.category}>
                    {guide.category}
                  </option>
                ))}
              </select>
            </label>

            <div className={selectedResult.isReceipt ? 'branch-box receipt' : 'branch-box document'}>
              <strong>{selectedResult.isReceipt ? '영수증 관리로 저장됩니다.' : '디지털 캐비닛에 저장됩니다.'}</strong>
              <p>
                {selectedResult.isReceipt
                  ? '영수증은 소비 분석을 위해 영수증 관리 페이지에서 별도로 관리합니다.'
                  : '일반 문서는 검색과 알림 관리를 위해 디지털 캐비닛에 보관합니다.'}
              </p>
            </div>

            <div className="extracted-fields">
              <h3>추출 정보</h3>
              {selectedResult.fields.map((field) => (
                <label key={field.label} className="form-label">
                  {field.label}
                  <input defaultValue={field.value} placeholder={`${field.label} 입력`} />
                </label>
              ))}
            </div>

            <div className="masking-panel">
              <div className="masking-head">
                <strong>민감정보 마스킹</strong>
                <span>Pro</span>
              </div>
              <p>저장 전 가릴 항목을 선택하세요.</p>
              <div className="masking-grid">
                <label><input type="checkbox" /> 주민등록번호</label>
                <label><input type="checkbox" /> 서명</label>
                <label><input type="checkbox" /> 계좌번호</label>
                <label><input type="checkbox" /> 전화번호</label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => setStep(1)}>
                업로드로 돌아가기
              </button>
              <button type="button" onClick={handleSave}>
                {selectedResult.isReceipt ? '영수증으로 등록' : '저장하고 등록'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
