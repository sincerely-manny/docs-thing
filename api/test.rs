use std::vec;

use printpdf::{BuiltinFont, Color, Mm, PdfDocument, Rgb, TextMatrix, TextRenderingMode};
use reqwest;
use serde::{Deserialize, Serialize};
use url::Url;
use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

#[derive(Serialize, Deserialize, Debug)]
struct Invoice {
    number: String,
    date: String,
    #[serde(rename = "dateString")]
    date_string: String,
    client: String,
    total: f32,
    #[serde(rename = "totalFormatted")]
    total_formatted: String,
    #[serde(rename = "totalWords")]
    total_words: String,
    services: Vec<Service>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Service {
    title: String,
    amount: i32,
    price: f32,
    #[serde(rename = "priceFormatted")]
    price_formatted: String,
    total: f32,
    #[serde(rename = "totalFormatted")]
    total_formatted: String,
}

pub async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let url = Url::parse(&req.uri().to_string()).unwrap();
    let (_, invoice_id) = url
        .query_pairs()
        .find(|(key, _)| key == "invoice_id")
        .expect("no invoice_id");

    let invoice_data: Invoice = reqwest::get(format!(
        "http://localhost:3000/json/invoice?invoiceId={}",
        invoice_id
    ))
    .await
    .expect("failed to get invoice data")
    .json::<Invoice>()
    .await
    .expect("failed to parse invoice data");

    println!("{:?}", invoice_data);

    let bytes = pdf();
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/pdf")
        .header("Content-Disposition", "inline; filename=invoice.pdf")
        .body(bytes.into())?)
}

fn pdf() -> Vec<u8> {
    let (doc, page1, layer1) =
        PdfDocument::new("PDF_Document_title", Mm(210.0), Mm(297.0), "Layer 1");
    let current_layer = doc.get_page(page1).get_layer(layer1);

    let mut font_reader =
        std::io::Cursor::new(include_bytes!("/Users/kirillserebrannyy/Sites/docs-thing/static/fonts/PlayfairDisplay/PlayfairDisplay-Regular.ttf").as_ref());

    let font = doc.add_external_font(&mut font_reader).unwrap();

    let text = "Lorem вваыа";
    let text2 = "dolor sit amet";

    // `use_text` is a wrapper around making a simple string
    current_layer.use_text(text, 48.0, Mm(10.0), Mm(10.0), &font);

    // // For more complex layout of text, you can use functions
    // // defined on the PdfLayerReference
    // // Make sure to wrap your commands
    // // in a `begin_text_section()` and `end_text_section()` wrapper
    // current_layer.begin_text_section();

    // // setup the general fonts.
    // // see the docs for these functions for details
    // current_layer.set_font(&font, 33.0);
    // current_layer.set_text_cursor(Mm(10.0), Mm(100.0));
    // current_layer.set_line_height(33.0);
    // current_layer.set_word_spacing(3000.0);
    // current_layer.set_character_spacing(10.0);

    // // write two lines (one line break)
    // current_layer.write_text(text, &font);
    // current_layer.add_line_break();
    // current_layer.write_text(text2, &font);
    // current_layer.add_line_break();

    // current_layer.set_text_rendering_mode(TextRenderingMode::FillStroke);
    // current_layer.set_character_spacing(0.0);
    // current_layer.set_text_matrix(TextMatrix::Rotate(10.0));

    // // write one line, but write text2 in superscript
    // current_layer.write_text(text, &font);
    // current_layer.set_line_offset(10.0);
    // current_layer.set_text_rendering_mode(TextRenderingMode::Stroke);
    // current_layer.set_font(&font, 18.0);
    // current_layer.write_text(text2, &font);

    // current_layer.end_text_section();

    // // Use text from a built-in font (no external resource needed)
    // let text = "Привет!--";
    // let font = doc.add_builtin_font(BuiltinFont::TimesBoldItalic).unwrap();
    // current_layer.use_text(text, 48.0, Mm(10.0), Mm(200.0), &font);

    let bytes = doc.save_to_bytes().expect("Error saving PDF");
    bytes
}

// fn pdf() -> Vec<u8> {
//     let font_family = genpdf::fonts::from_files(
//         "/Users/kirillserebrannyy/Sites/docs-thing/static/fonts/PlayfairDisplay",
//         "PlayfairDisplay",
//         None,
//     )
//     .expect("Failed to load font family");

//     let mut doc = genpdf::Document::new(font_family);
//     doc.set_font_size(10);
//     let mut decorator = genpdf::SimplePageDecorator::new();
//     let margins = genpdf::Margins::trbl(20, 15, 20, 15);
//     decorator.set_margins(margins);
//     doc.set_page_decorator(decorator);

//     /////////
//     // Header
//     /////////
//     let mut header = TableLayout::new(vec![2, 2, 2]);
//     header
//         .row()
//         .element(
//             Image::from_path("/Users/kirillserebrannyy/Sites/docs-thing/static/img/logo.jpg")
//                 .expect("Failed to load image")
//                 .with_scale(Scale { x: 0.5, y: 0.5 }),
//         )
//         .element(
//             LinearLayout::vertical()
//                 .element(Paragraph::new("Коллегия"))
//                 .element(Paragraph::new("Адвокатов"))
//                 .element(Paragraph::new("Санкт-Петербурга"))
//                 .styled(style::Style::new().with_font_size(16).italic())
//                 .padded(Margins::trbl(-2, 0, 0, 0)),
//         )
//         .element(
//             LinearLayout::vertical()
//                 .element(
//                     Paragraph::new("Бизнес-коллегия")
//                         .styled(style::Style::new().with_font_size(20)),
//                 )
//                 .element(
//                     Paragraph::new("«АСТЭР»")
//                         .styled(style::Style::new().with_font_size(36))
//                         .padded(Margins::trbl(-2, 0, 0, 0)),
//                 )
//                 .styled(style::Style::new().italic())
//                 .padded(Margins::trbl(-3, 0, 0, 0)),
//         )
//         .push()
//         .unwrap();
//     doc.push(header);

//     doc.push(elements::Break::new(2));

//     doc.push(Paragraph::new(
//         "Поставщик: Коллегия адвокатов Санкт-Петербурга «Бизнес-коллегия «АСТЭР»",
//     ));

//     doc.push(elements::Break::new(1));

//     //////////
//     // Details
//     //////////

//     let mut details = TableLayout::new(vec![6, 5]);
//     let mut inn = TableLayout::new(vec![2, 4, 2, 8]);
//     inn.row()
//         .element(Text::new("ИНН:").styled(style::Style::new().bold()))
//         .element(Text::new("7841000153"))
//         .element(Text::new("КПП:").styled(style::Style::new().bold()))
//         .element(Text::new("784101001"))
//         .push()
//         .unwrap();
//     let mut rs = TableLayout::new(vec![2, 12, 1, 1]);
//     rs.row()
//         .element(Text::new("р/с:").styled(style::Style::new().bold()))
//         .element(Text::new("40703810555230109434"))
//         .element(Text::new(""))
//         .element(Text::new(""))
//         .push()
//         .unwrap();
//     let mut ks = TableLayout::new(vec![2, 8, 2, 4]);
//     ks.row()
//         .element(Text::new("к/с:").styled(style::Style::new().bold()))
//         .element(Text::new("30101810500000000653"))
//         .element(Text::new("БИК:").styled(style::Style::new().bold()))
//         .element(Text::new("044030653"))
//         .push()
//         .unwrap();

//     details
//         .row()
//         .element(
//             LinearLayout::vertical()
//                 .element(Paragraph::new(
//                     "191186, Санкт-Петербург, Невский пр., д. 30, оф. 6.11",
//                 ))
//                 .element(
//                     Paragraph::new("Центральное ОСБ № 1991/0786")
//                         .styled(style::Style::new().bold()),
//                 )
//                 .element(
//                     Paragraph::new("Северо-Западный банк ПАО Сбербанк")
//                         .styled(style::Style::new().bold()),
//                 ),
//         )
//         .element(
//             LinearLayout::vertical()
//                 .element(inn)
//                 .element(rs)
//                 .element(ks),
//         )
//         .push()
//         .unwrap();
//     doc.push(details);

//     doc.push(elements::Break::new(1));

//     doc.push(
//         elements::Break::new(0)
//             .framed()
//             .styled(style::Color::Rgb(100, 100, 100)),
//     );
//     doc.push(elements::Break::new(1));

//     let mut separator = TableLayout::new(vec![1]);
//     separator.set_cell_decorator(elements::FrameCellDecorator::new(true, false, false));
//     separator.row().element(Text::new(" ")).push().unwrap();
//     separator.row().element(Text::new(" ")).push().unwrap();

//     doc.push(separator);

//     //////////
//     // Invoice
//     //////////

//     let mut bytes: Vec<u8> = Vec::new();
//     doc.render(&mut bytes).expect("Failed to write PDF file");
//     bytes
// }
