# Contact Form GAS / Sheet 對齊說明

## 目的

這份設定用來把網站表單的資料，穩定寫進 Google Sheet，並讓 `LINE ID` 成為獨立欄位。

目前前端已經會送出以下欄位：

- `name`
- `phone`
- `lineId`
- `serviceType`
- `location`
- `message`

另外若舊版前端仍把 `LINE ID` 補進 `message` 內，`contact-form-handler.gs` 也會自動去重，不會讓 Sheet 裡重複。

## 建議 Sheet 欄位順序

請把 Google Sheet 第一列調整成以下欄位順序：

1. `時間戳記`
2. `姓名`
3. `聯絡電話`
4. `LINE ID`
5. `工程項目`
6. `施工地點`
7. `需求內容`
8. `來源頁面`
9. `User Agent`

如果你直接使用 `contact-form-handler.gs`，程式也會自動補上這組 headers。

## 建議 Sheet 名稱

請將工作表命名為：

`Leads`

如果不存在，程式會自動建立。

## 目前指定的 Spreadsheet

這次已經依你提供的檔案，寫死成這份 Spreadsheet：

- Spreadsheet ID：`1cqOcMi5Ld6mF6hK-byXGrfRVFikBtErJmQJ2SwOiiEg`
- Google Sheet：`docs.google.com/spreadsheets/d/1cqOcMi5Ld6mF6hK-byXGrfRVFikBtErJmQJ2SwOiiEg`

所以這份 `contact-form-handler.gs` 是設計給 **standalone Apps Script** 或任何沒有綁定特定 Sheet 的腳本使用；它會直接寫進這份指定的表，而不是依賴 `getActiveSpreadsheet()`。

## Apps Script 部署步驟

1. 打開目前網站正在使用的 Google Apps Script 專案。
2. 用 [contact-form-handler.gs](./contact-form-handler.gs) 的內容覆蓋原本處理表單的 `doGet` / `doPost`。
3. 確認執行這支 Web App 的 Google 帳號，對這份 Spreadsheet 具有編輯權限。
4. 重新部署 Web App：
   - Execute as: `Me`
   - Who has access: `Anyone`
5. 部署完成後，保留原本的 `/exec` URL，前端就不用再改。

## 寫入結果

每一筆資料會長這樣：

- `時間戳記`：送出時間
- `姓名`：表單姓名
- `聯絡電話`：表單電話
- `LINE ID`：新欄位
- `工程項目`：服務類型
- `施工地點`：台南行政區
- `需求內容`：純需求描述，不重複塞 `LINE ID`
- `來源頁面`：預留欄位，可之後再接前端 page URL
- `User Agent`：預留欄位，可之後再接前端 UA

## 目前前端狀態

網站前端已完成以下調整：

- 線上諮詢表單新增 `LINE ID`
- 表單送出會帶 `lineId`
- 舊相容模式下，`LINE ID` 也會備援寫進 `message`

所以目前的切換策略是：

- **前端先上線也不會漏資料**
- **GAS / Sheet 更新後，資料會變成乾淨的獨立欄位**
