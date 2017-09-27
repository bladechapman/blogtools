
interface BlogItem {
  yaml: any;
  html: string;
}

function generateHtml(listItemHtml: string[]): string {
  const listHtml = listItemHtml.join('');
  const stylesheetLocation = `./index.css`;
  const indexTemplate = `<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0"><meta name="apple-mobile-web-app-capable" content="yes" /><title>Writing</title><link rel="stylesheet" type="text/css" href="${stylesheetLocation}"><body><div id="title">Writing</div><ul style="list-style-type:none"><div class="divider"></div><div id="links"><a href="http://bladeismyna.me">Blade Chapman</a></div>${listHtml}</ul></body>`;

  return indexTemplate;
}

function genIndex(items: BlogItem[]): string {
  let sorted = items.concat().sort((a: BlogItem, b: BlogItem): number => {
    if (new Date(a) < new Date(b)) return -1;
    else if (new Date(a) > new Date(b)) return 1;
    else return 0;
  });

  let listItems = sorted.map((item: BlogItem): string => {
    let date = item.yaml.date;
    let title = item.yaml.title;
    let subtitle = item.yaml.subtitle;
    let link = "http://bladeismyna.me"

    return `<li><a href="${link}"><div class="item-title">${title}</div></a><div class="item-subtitle">${subtitle}</div><div class="item-date">${date}</div></li>`;
  });

  return generateHtml(listItems);
}

export default genIndex;
