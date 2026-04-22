# 元書輸入法安裝並增加大易輸入法方案，以及鍵盤佈局與按鍵輸出視覺化工具

這是一個專為元書輸入法鍵盤皮膚開發所設計的網頁版視覺化工具集合。透過這些基於前端網頁技術的輕量級編輯器，開發者與愛好者可以更直覺地設計、預覽與調整鍵盤佈局。這些工具針對Rime框架之元書輸入法，大易（Dayi）輸入方案進行佈局、滑動、長按與外觀的客製化調整。

## 📦 專案內容與工具介紹

本儲存庫包含以下主要的網頁工具與視覺資源：

* **`index.html`**
    專案的主頁面與導覽入口，元書輸入法安裝與增加大易輸入法方案說明。

* **`keyboard_config_studio.html`**
    **鍵盤配置工作室(整合鍵盤佈局與按鍵滑動工具)**：更容易與方便使用者編輯元書皮膚，頁面會直接解壓縮取得對應的檔案，並且匯入相對應的頁面，匯出.cskin檔案即可匯入裝置(匯入後記得長按皮膚選擇運行main.jsonnet)

    省掉複雜步驟的困擾:<BR>
    原本: 改檔名-->解壓縮-->找對應檔案-->修攻-->重新壓縮-->改檔名-->匯入裝置<br>
    現在: 直接上傳皮膚檔.cskin-->修改-->匯出.cskin-->匯入裝置

* **`keyboard_config_studio_Manual.html`**
    **鍵盤配置工作室(整合鍵盤佈局與按鍵滑動工具)使用者操作手冊**：操作說明

* **`keyboard_layout_color_tools.html`**
    **鍵盤佈局與配色工具**：提供視覺化的介面，讓你可以輕鬆配置鍵盤的按鍵排列與顏色主題，即時預覽各種主題風格下的鍵盤外觀。

* **`keyboard_swipe_hint_tools.html`**
    **按鍵滑動與長按 (Swipe & Hint) 編輯工具**：用來設定按鍵上的滑動或長按提示符號。在設計需要支援滑動與長按方式對應不同輸出的輸入法方案時，能提供相當直覺的設定介面。


## 🚀 使用方式

本專案所有的工具皆為純靜態的 HTML 檔案，無須安裝任何後端環境或伺服器。只需用瀏覽器即可開始使用視覺化編輯功能：

* 元書輸入法安裝與增加大易輸入方案說明網頁
https://hans52088.github.io/web/

* 元書皮膚cskin整合打包修改工作室
https://hans52088.github.io/web/keyboard_config_studio.html

* 元書皮膚cskin整合打包修改工作室操作手冊
https://hans52088.github.io/web/keyboard_config_studio_Manual.html

* 鍵盤佈局與顏色視覺化編輯器
https://hans52088.github.io/web/keyboard_layout_color_tools.html

* 鍵盤上下滑與長按配置視覺化編輯器
https://hans52088.github.io/web/keyboard_swipe_hint_tools.html

