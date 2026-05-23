import Link from "next/link";

interface DashboardCardProps {
  title: string;
  href: string;
  description: string;
  metaText?: string; // Optional metadata tag like "UNESCO World Heritage Site"
}

export default function GovUKDashboardCard({ title, href, description, metaText }: DashboardCardProps) {
  return (
    <div 
      className="govuk-!-margin-bottom-4"
      style={{
        border: "1px solid #b1b4b6",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderLeft: "5px solid #1d70b8"
      }}
    >
      <h3 className="govuk-heading-m govuk-!-margin-bottom-1" style={{ marginTop: 0 }}>
        <Link href={href} className="govuk-link" style={{ textDecorationThickness: "2px" }}>
          {title}
        </Link>
      </h3>
      
      {metaText && (
        <span 
          className="govuk-body-s" 
          style={{ 
            display: "inline-block", 
            backgroundColor: "#f3f2f1", 
            color: "#505a5f", 
            padding: "2px 8px", 
            fontWeight: "bold",
            marginBottom: "10px"
          }}
        >
          {metaText}
        </span>
      )}
      
      <p className="govuk-body" style={{ color: "#0b0c0c", margin: 0 }}>
        {description}
      </p>
    </div>
  );
}
