import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Badge } from "./Badge";
import { ShowCard } from "./ShowCard";
import { TableHeaderCell, TableRowCell } from "./TableCell";
import { cx } from "./wikiUtils";

type DetailCardBadgeTone = "info" | "error" | "neutral" | "warning";

export interface DetailCardFeature {
  title: string;
  description?: string;
  label?: string;
  imageSrc?: string;
}

export interface DetailCardInfoItem {
  label: string;
  value: string;
}

export interface DetailCardStatusBadge {
  label: string;
  tone?: DetailCardBadgeTone;
}

export interface DetailCardTableColumn {
  key: string;
  label: ReactNode;
  width?: string;
}

export type DetailCardTableRow = Record<string, ReactNode>;

export interface DetailCardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  badges?: string[];
  features?: DetailCardFeature[];
  infoItems?: DetailCardInfoItem[];
  statusBadges?: DetailCardStatusBadge[];
  tableColumns?: DetailCardTableColumn[];
  tableRows?: DetailCardTableRow[];
  table?: Array<{ label: string; value: string; icon?: ReactNode }>;
  aside?: ReactNode;
}

const defaultFeatures: DetailCardFeature[] = [
  { title: "详情名称", description: "详情介绍介绍", label: "标签", imageSrc: "/assets/preview/map-placeholder.png" },
  { title: "详情名称", description: "详情介绍介绍", label: "标签", imageSrc: "/assets/preview/map-placeholder.png" },
];

const defaultInfoItems: DetailCardInfoItem[] = [
  { label: "Account Manager", value: "James Brown" },
  { label: "Contract Value", value: "$250,000" },
  { label: "Start Date", value: "2024-01-15" },
  { label: "Member", value: "45" },
];

const defaultStatusBadges: DetailCardStatusBadge[] = [
  { label: "辅助标签", tone: "info" },
  { label: "辅助标签", tone: "error" },
  { label: "辅助标签", tone: "neutral" },
  { label: "辅助标签", tone: "warning" },
];

const defaultTableColumns: DetailCardTableColumn[] = [
  { key: "level", label: "等级", width: "80px" },
  { key: "attack", label: "攻击", width: "80px" },
  { key: "price", label: "价格", width: "100px" },
  { key: "material", label: "材料", width: "minmax(0, 1fr)" },
];

const defaultTableRows: DetailCardTableRow[] = [
  { level: "0", attack: "12", price: "2,500", material: "表格内容" },
  { level: "1", attack: "123", price: "2,500", material: "表格内容" },
  { level: "2", attack: "1234", price: "2,500", material: "表格内容" },
  { level: "3", attack: "1233", price: "2,500", material: "表格内容" },
];

export function DetailCard({
  title = "详情信息1",
  description = "项目详细介绍",
  badges = [],
  features = defaultFeatures,
  infoItems = defaultInfoItems,
  statusBadges,
  tableColumns,
  tableRows,
  table = [],
  className = "",
  children,
  ...props
}: DetailCardProps) {
  const resolvedStatusBadges =
    statusBadges ??
    (badges.length > 0 ? badges.map((badge): DetailCardStatusBadge => ({ label: badge, tone: "neutral" })) : defaultStatusBadges);

  const resolvedTableRows: DetailCardTableRow[] =
    tableRows ??
    (table.length > 0
      ? table.map((row): DetailCardTableRow => ({
          label: row.label,
          value: row.value,
        }))
      : defaultTableRows);
  const resolvedTableColumns: DetailCardTableColumn[] =
    tableColumns ??
    (table.length > 0
      ? [
          { key: "label", label: "属性", width: "minmax(0, 1fr)" },
          { key: "value", label: "数值", width: "minmax(0, 1fr)" },
        ]
      : defaultTableColumns);
  const tableStyle = {
    "--gt-wiki-table-columns": resolvedTableColumns.map((column) => column.width ?? "minmax(0, 1fr)").join(" "),
  } as CSSProperties;

  return (
    <article className={cx("gt-wiki-detail-card", className)} {...props}>
      <div className="gt-wiki-detail-card__title-row">
        <span className="gt-wiki-detail-card__title-mark" aria-hidden="true" />
        <h3 className="gt-wiki-detail-card__title">{title}</h3>
      </div>
      {description ? <p className="gt-wiki-detail-card__description">{description}</p> : null}
      {children}

      {features.length > 0 ? (
        <div className="gt-wiki-detail-card__features">
          {features.map((feature, index) => (
            <ShowCard
              key={`${feature.title}-${index}`}
              className="gt-wiki-detail-card__feature-card"
              title={feature.title}
              description={feature.description}
              label={feature.label}
              imageSrc={feature.imageSrc}
            />
          ))}
        </div>
      ) : null}

      {infoItems.length > 0 ? (
        <dl className="gt-wiki-detail-card__info">
          {infoItems.map((item) => (
            <div key={item.label} className="gt-wiki-detail-card__info-item">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {resolvedStatusBadges.length > 0 ? (
        <div className="gt-wiki-detail-card__badges">
          {resolvedStatusBadges.map((badge, index) => (
            <Badge key={`${badge.label}-${badge.tone ?? "neutral"}-${index}`} className={`gt-wiki-detail-card__badge gt-wiki-detail-card__badge--${badge.tone ?? "neutral"}`}>
              {badge.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {resolvedTableColumns.length > 0 && resolvedTableRows.length > 0 ? (
        <div className="gt-wiki-detail-card__table" role="table" aria-label="详情数据" style={tableStyle}>
          <div className="gt-wiki-detail-card__table-row gt-wiki-detail-card__table-row--header" role="row">
            {resolvedTableColumns.map((column) => (
              <TableHeaderCell key={column.key}>
                {column.label}
              </TableHeaderCell>
            ))}
          </div>
          {resolvedTableRows.map((row, rowIndex) => (
            <div key={`table-row-${rowIndex}`} className="gt-wiki-detail-card__table-row" role="row">
              {resolvedTableColumns.map((column) => (
                <TableRowCell key={column.key} state={row[column.key] == null || row[column.key] === "" ? "none" : "default"}>
                  {row[column.key]}
                </TableRowCell>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
