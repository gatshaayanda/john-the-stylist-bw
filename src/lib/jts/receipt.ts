export type ReceiptOrder={id:string;createdAt:string;customerName:string;phone:string;mode:"pickup"|"delivery";scheduledFor:string;deliveryLocation:string;instructions:string;items:{name:string;price:number;quantity:number}[];total:number;status:string};

function escapePdf(value:string){
  return value
    .replace(/\\/g,"\\\\")
    .replace(/\(/g,"\\(")
    .replace(/\)/g,"\\)")
    .replace(/[^\\x20-\\x7E]/g,"");
}
function wrap(value:string,max=56){
  if(!value)return [];
  const words=value.split(/\\s+/);
  const lines:string[]=[];
  let line="";
  for(const word of words){
    if((line+" "+word).trim().length>max&&line){lines.push(line);line=word;}
    else line=(line+" "+word).trim();
  }
  if(line)lines.push(line);
  return lines;
}
export function downloadReceiptPdf(order:ReceiptOrder){
  const reference=order.id.slice(0,8).toUpperCase();
  const requested=new Date(order.scheduledFor).toLocaleString("en-BW",{timeZone:"Africa/Gaborone"});
  const lines:Array<[string,number]>=[
    ["JTS STYLES",24],
    ["JOHN THE STYLIST BW",14],
    ["Hairstyling · Colour · Cuts · Barbering",10],
    ["",8],["BOOKING SUMMARY",13],["Reference #"+reference,10],["",6],
    ["Customer: "+order.customerName,10],["WhatsApp/Phone: "+order.phone,10],
    ["Requested: "+requested,10]
  ];
  lines.push(["",8],["SERVICES",11]);
  for(const item of order.items) lines.push(...wrap(item.quantity+" x "+item.name,48).map(line=>[line,10] as [string,number]),["  P"+(item.price*item.quantity).toFixed(2),10]);
  lines.push(["",6],["TOTAL  P"+order.total.toFixed(2),15],["Request status: "+(order.status==="New"?"Received":order.status),10]);
  if(order.instructions) lines.push(["",7],...wrap("Notes: "+order.instructions).map(line=>[line,9] as [string,number]));
  lines.push(["",12],["Thank you for choosing John The Stylist Bw.",10],["50% deposit required to secure an appointment.",9],["Orange Money · 75720306 · John SHUMBA",9]);

  const pageHeight=842; let y=795;
  const content:string[]=["q","0.043 0.043 0.047 rg","40 720 515 95 re f","Q","0.78 0.64 0.35 rg","40 716 515 4 re f","0 0 0 rg"];
  for(const [raw,size] of lines){
    if(!raw){y-=12;continue;}
    if(raw==="BOOKING SUMMARY"||raw.startsWith("TOTAL")) content.push("0.11 0.66 1 rg");
    else if(raw==="JTS STYLES"||raw==="JOHN THE STYLIST BW") content.push("0.78 0.64 0.35 rg");
    else content.push("0.95 0.95 0.95 rg");
    content.push("BT /F1 "+size+" Tf 50 "+y+" Td ("+escapePdf(raw)+") Tj ET");
    y-=size+9;
    if(y<55)break;
  }
  content.push("0.78 0.64 0.35 rg","40 38 515 3 re f");
  const stream=content.join("\\n");
  const objects=[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 "+pageHeight+"] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length "+new TextEncoder().encode(stream).length+" >>\\nstream\\n"+stream+"\\nendstream"
  ];
  let pdf="%PDF-1.4\\n"; const offsets:number[]=[];
  objects.forEach((obj,i)=>{offsets[i+1]=pdf.length;pdf+=(i+1)+" 0 obj\\n"+obj+"\\nendobj\\n";});
  const xref=pdf.length;
  pdf+="xref\\n0 "+(objects.length+1)+"\\n0000000000 65535 f \\n";
  for(let i=1;i<=objects.length;i++) pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \\n";
  pdf+="trailer\\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\\nstartxref\\n"+xref+"\\n%%EOF";
  const blob=new Blob([pdf],{type:"application/pdf"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="JTS-booking-"+reference+".pdf";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
