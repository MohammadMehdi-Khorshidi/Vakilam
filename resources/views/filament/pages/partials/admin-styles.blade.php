<style>
.vk-admin{direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;color:#173f38}
.vk-grid{display:grid;gap:16px}
.vk-card{background:#fff;border:1px solid #dce6e2;border-radius:20px;padding:20px;box-shadow:0 8px 28px rgba(13,51,44,.045)}
.vk-hero{display:flex;align-items:center;justify-content:space-between;gap:20px;border:1px solid #d8e4df;border-radius:22px;padding:24px;margin-bottom:18px;background:radial-gradient(circle at 10% 0,#c9a96e24,transparent 26%),linear-gradient(145deg,#174b42,#0e332d);color:white}
.vk-hero h2{margin:7px 0 6px;font-size:24px;font-weight:950}.vk-hero p{margin:0;color:rgba(255,255,255,.72);font-size:13px;line-height:2}
.vk-eyebrow{font-size:11px;font-weight:800;color:#dbc48e}.vk-role-chip{flex:none;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);border-radius:999px;padding:9px 14px;color:#f1dfb7;font-size:12px;font-weight:900}
.vk-stats{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:18px}
.vk-stat{min-height:104px;background:#fff;border:1px solid #dce6e2;border-radius:18px;padding:18px;box-shadow:0 5px 18px rgba(13,51,44,.035)}
.vk-stat b{display:block;color:#173f38;font-size:27px;margin-top:9px;font-weight:950}.vk-stat span{font-size:12px;color:#75857f;font-weight:700}
.vk-dashboard-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.vk-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.vk-input,.vk-select,.vk-textarea{border:1px solid #d3dfda;border-radius:13px;background:#fff;padding:10px 12px;color:#294e46;min-height:42px;outline:none;transition:.18s ease}
.vk-input:focus,.vk-select:focus,.vk-textarea:focus{border-color:#9ebdb3;box-shadow:0 0 0 3px rgba(23,76,66,.06)}
.vk-input{min-width:260px}.vk-textarea{width:100%;min-height:78px}
.vk-table{width:100%;border-collapse:collapse;font-size:13px}.vk-table th{background:#f3f7f5;color:#315f54;text-align:right;padding:12px;border-bottom:1px solid #dfe7e3;white-space:nowrap}
.vk-table td{padding:13px 12px;border-bottom:1px solid #edf2ef;vertical-align:top}.vk-table tbody tr:hover{background:#fbfdfc}
.vk-badge{display:inline-flex;align-items:center;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:850;background:#edf5f2;color:#315f54;white-space:nowrap}
.vk-badge.gold{background:#fff6df;color:#87631c}.vk-badge.red{background:#fff0f0;color:#a33c3c}
.vk-btn{border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;border-radius:11px;padding:9px 13px;font-size:12px;font-weight:850;background:#174c42;color:#fff;transition:.18s ease}
.vk-btn:hover{filter:brightness(.95)}.vk-btn.gold{background:#b58b3b}.vk-btn.red{background:#a64242}.vk-btn.soft{background:#edf5f2;color:#315f54}
.vk-muted{color:#788883;font-size:12px;line-height:1.9}.vk-title{font-size:16px;font-weight:950;color:#173f38}.vk-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}
.vk-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:12px}.vk-list{display:grid}.vk-list-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid #edf2ef}.vk-list-row:last-child{border-bottom:0}.vk-empty{padding:24px 10px;text-align:center;color:#899691;font-size:13px}
@media(max-width:900px){.vk-dashboard-columns{grid-template-columns:1fr}.vk-hero{align-items:flex-start;flex-direction:column}}
@media(max-width:800px){.vk-table-wrap{overflow-x:auto}.vk-input{min-width:100%;width:100%}}
</style>
