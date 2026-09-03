import React, { useState, useEffect } from "react";
import {
  StudentApiService,
  StudentMaterialsResponse,
} from "@/src/services/studentApi";
import {
  FileText,
  Video,
  Link2,
  Download,
  ExternalLink,
  Search,
} from "lucide-react";

import "./StudentMaterialsPage.css";

export const StudentMaterialsPage: React.FC = () => {
  const [materialsData, setMaterialsData] =
    useState<StudentMaterialsResponse | null>(null);

  const [search, setSearch] = useState<string>("");
  const [selectedType, setSelectedType] =
    useState<string>("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await StudentApiService.getMyMaterials({
            search,
          });

        setMaterialsData(data);
      } catch (err) {
        console.error(
          "Failed to load materials:",
          err
        );
      }
    };

    load();
  }, [search]);

  const materials = materialsData?.materials || [];

  const filteredMaterials = materials.filter(
    (material) => {
      if (
        selectedType !== "ALL" &&
        material.fileType !== selectedType
      ) {
        return false;
      }

      return true;
    }
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return (
          <FileText
            size={20}
            className="student-materials__file-icon--pdf"
          />
        );

      case "VIDEO":
        return (
          <Video
            size={20}
            className="student-materials__file-icon--video"
          />
        );

      case "LINK":
        return (
          <Link2
            size={20}
            className="student-materials__file-icon--link"
          />
        );

      default:
        return (
          <FileText
            size={20}
            className="student-materials__file-icon--default"
          />
        );
    }
  };

  return (
    <div className="student-materials">
      <div className="student-materials__header">
        <h1>Study Materials & Resources</h1>

        <p>
          Lecture notes, reference PDFs, solved problem
          sheets, and instructional videos for your
          subjects.
        </p>
      </div>

      <div className="card student-materials__filters-card">
        <div className="student-materials__filters">
          <div className="student-materials__search">
            <Search
              size={18}
              className="student-materials__search-icon"
            />

            <input
              type="text"
              placeholder="Search materials by title or keywords..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="student-materials__type-filters">
            {["ALL", "PDF", "VIDEO", "LINK"].map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setSelectedType(type)
                  }
                  className={`btn student-materials__filter-button ${
                    selectedType === type
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="student-materials__list">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="card student-materials__item"
          >
            <div className="student-materials__content">
              <div className="student-materials__icon-box">
                {getFileIcon(material.fileType)}
              </div>

              <div className="student-materials__details">
                <div className="student-materials__badges">
                  <span className="badge badge-primary">
                    {material.subject.code ||
                      material.subject.name}
                  </span>

                  <span className="badge badge-gray">
                    {material.fileType}
                  </span>
                </div>

                <h3>{material.title}</h3>

                {material.description && (
                  <p className="student-materials__description">
                    {material.description}
                  </p>
                )}

                <div className="student-materials__meta">
                  Uploaded on{" "}
                  {new Date(
                    material.createdAt
                  ).toLocaleDateString()}
                  <span>•</span>
                  {material.course.name}
                </div>
              </div>
            </div>

            <a
              href={material.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary student-materials__action"
            >
              {material.fileType === "LINK" ||
              material.fileType === "VIDEO" ? (
                <>
                  <ExternalLink size={16} />
                  Open Resource
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Document
                </>
              )}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};