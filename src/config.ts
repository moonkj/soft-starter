/**
 * 카탈로그 PDF 주소 (public/ 기준 상대 경로). "카탈로그 p.N"은 이 파일의 N쪽을 새 탭으로 연다.
 * 파일: LS ELECTRIC LV Soft Starter LVSS 카탈로그(국문, 20쪽) 웹용 경량본 2.6MB.
 * 쪽 번호는 data/lvss-selection.json의 frames[].page와 같다(p.6 선정 가이드, p.7~11 프레임 사양).
 * null로 두면 링크가 열리지 않는다.
 */
export const CATALOG_PDF_URL: string | null = './catalogs/LVSS_Catalog_KO.pdf'
