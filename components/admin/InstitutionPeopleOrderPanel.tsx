"use client";

import { useEffect, useState } from "react";
import {
  orderInstitutionPeopleLevels,
  type InstitutionPeopleLevel,
} from "@/lib/institutions/people-model";

type Level = InstitutionPeopleLevel;
type Person = {
  id: string;
  name: string;
  title: string;
  priority: number | null;
  level_id: string;
  order: number | "";
};

type PanelData = { levels: Level[]; people: Person[] };

function sortPanelData(data: PanelData): PanelData {
  return {
    levels: orderInstitutionPeopleLevels(data.levels),
    people: [...data.people].sort(
      (a, b) =>
        (a.priority ?? Number.MAX_SAFE_INTEGER) -
          (b.priority ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name),
    ),
  };
}

export default function InstitutionPeopleOrderPanel({
  institutionId,
  institutionName,
}: {
  institutionId: string;
  institutionName: string;
}) {
  const [data, setData] = useState<PanelData>({ levels: [], people: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch(
      `/api/admin/institutions/${institutionId}/people-order`,
      { credentials: "include", cache: "no-store" },
    );
    const json = await response.json();
    if (!response.ok) {
      throw new Error([json.error, json.hint].filter(Boolean).join(" "));
    }
    setData(sortPanelData(json as PanelData));
    setDirty(false);
  };

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/institutions/${institutionId}/people-order`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) {
          throw new Error([json.error, json.hint].filter(Boolean).join(" "));
        }
        if (active) setData(sortPanelData(json as PanelData));
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not load people ordering.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [institutionId]);

  const updatePerson = (personId: string, patch: Partial<Person>) => {
    setData((current) => ({
      ...current,
      people: current.people.map((person) =>
        person.id === personId ? { ...person, ...patch } : person,
      ),
    }));
    setDirty(true);
    setError(null);
    setSuccess(null);
  };

  const nextOrder = (personId: string, levelId: string) =>
    data.people
      .filter((person) => person.id !== personId && person.level_id === levelId)
      .reduce((maximum, person) => Math.max(maximum, Number(person.order) || 0), 0) + 1;

  const updateLevel = (levelId: string, patch: Partial<Level>) => {
    setData((current) => ({
      ...current,
      levels: current.levels.map((level) =>
        level.id === levelId ? { ...level, ...patch } : level,
      ),
    }));
    setDirty(true);
    setError(null);
  };

  const addMainLevel = () => {
    setData((current) => ({
      ...current,
      levels: [
        ...current.levels,
        {
          id: crypto.randomUUID(),
          name: "",
          sort_order:
            Math.max(
              0,
              ...current.levels
                .filter((level) => !level.parent_level_id)
                .map((level) => level.sort_order),
            ) + 1,
          parent_level_id: null,
        },
      ],
    }));
    setDirty(true);
    setError(null);
  };

  const addSubcategory = (parentLevelId: string) => {
    setData((current) => ({
      ...current,
      levels: [
        ...current.levels,
        {
          id: crypto.randomUUID(),
          name: "",
          sort_order:
            Math.max(
              0,
              ...current.levels
                .filter((level) => level.parent_level_id === parentLevelId)
                .map((level) => level.sort_order),
            ) + 1,
          parent_level_id: parentLevelId,
        },
      ],
    }));
    setDirty(true);
    setError(null);
  };

  const removeLevel = (levelId: string) => {
    setData((current) => {
      const remainingLevels = current.levels
        .filter((level) => level.id !== levelId)
        .map((level) =>
          level.parent_level_id === levelId
            ? { ...level, parent_level_id: null }
            : level,
        );
      const levels = remainingLevels.map((level) => {
        const siblings = remainingLevels
          .filter((candidate) => candidate.parent_level_id === level.parent_level_id)
          .sort(
            (a, b) =>
              a.sort_order - b.sort_order || a.name.localeCompare(b.name),
          );
        return {
          ...level,
          sort_order: siblings.findIndex((sibling) => sibling.id === level.id) + 1,
        };
      });
      return {
        levels,
        people: current.people.map((person) =>
          person.level_id === levelId
            ? { ...person, level_id: "", order: "" }
            : person,
        ),
      };
    });
    setDirty(true);
    setError(null);
  };

  const mainLevels = orderInstitutionPeopleLevels(data.levels).filter(
    (level) => !level.parent_level_id,
  );

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `/api/admin/institutions/${institutionId}/people-order`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            levels: data.levels,
            assignments: data.people.map((person) => ({
              person_id: person.id,
              level_id: person.level_id || null,
              order: person.level_id ? person.order : null,
            })),
          }),
        },
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error([json.error, json.hint].filter(Boolean).join(" "));
      }
      await load();
      setSuccess("Official levels and display order saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save official ordering.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="govuk-body">Loading current officials…</p>;
  }

  return (
    <section className="govuk-!-margin-top-8" aria-labelledby="institution-people-order-heading">
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h2 className="govuk-heading-l" id="institution-people-order-heading">
        Current officials: levels and order
      </h2>
      <p className="govuk-body">
        Set seniority groups for people currently serving at {institutionName || "this institution"}.
        Main levels appear in order, with optional subcategories beneath them. Assign each official
        to a main category, then optionally choose one of that category’s subcategories. Leave the
        subcategory empty to assign the official directly to the main category. Lower numbers appear
        first within the selected group.
      </p>
      <p className="govuk-hint">
        This changes the institution profile only. If no level is assigned, people keep the automatic
        order based on their role priority and position rank. A person with several current roles is
        shown once, using their highest-ranked assigned level and order.
      </p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h3 className="govuk-error-summary__title">There is a problem</h3>
          <p className="govuk-body">{error}</p>
        </div>
      )}
      {success && <p className="govuk-body" role="status">{success}</p>}

      <div className="govuk-grid-row govuk-!-margin-bottom-3">
        <div className="govuk-grid-column-two-thirds">
          <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
            Seniority categories
          </h3>
          <p className="govuk-hint govuk-!-margin-bottom-0">
            Categories and their subcategories are shown in the order used on the public profile.
          </p>
        </div>
        <div className="govuk-grid-column-one-third govuk-!-text-align-right">
          <span className="govuk-body-s">
            {mainLevels.length} {mainLevels.length === 1 ? "category" : "categories"}
          </span>
        </div>
      </div>
      {mainLevels.length === 0 && (
        <div className="govuk-inset-text">
          <p className="govuk-body govuk-!-margin-bottom-0">
            No categories yet. Add a category to start arranging officials into seniority groups.
          </p>
        </div>
      )}
      {mainLevels.map((level, index) => {
        const subcategories = orderInstitutionPeopleLevels(data.levels).filter(
          (candidate) => candidate.parent_level_id === level.id,
        );
        return (
          <fieldset
            className="govuk-fieldset govuk-!-margin-bottom-5 govuk-!-padding-4"
            key={level.id}
            style={{ border: "1px solid #b1b4b6" }}
          >
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m govuk-!-padding-1">
              Category {index + 1}
            </legend>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <label className="govuk-label" htmlFor={`people-level-name-${level.id}`}>
                  Category name
                </label>
                <input
                  className="govuk-input"
                  id={`people-level-name-${level.id}`}
                  value={level.name}
                  maxLength={100}
                  onChange={(event) =>
                    updateLevel(level.id, { name: event.target.value })
                  }
                />
              </div>
              <div className="govuk-grid-column-one-sixth">
                <label className="govuk-label" htmlFor={`people-level-order-${level.id}`}>
                  Display order
                </label>
                <input
                  className="govuk-input"
                  id={`people-level-order-${level.id}`}
                  type="number"
                  min={1}
                  step={1}
                  value={level.sort_order}
                  onChange={(event) =>
                    updateLevel(level.id, { sort_order: Number(event.target.value) })
                  }
                />
              </div>
              <div className="govuk-grid-column-one-sixth govuk-!-padding-top-6">
                <button
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                  type="button"
                  onClick={() => removeLevel(level.id)}
                >
                  Remove category
                </button>
              </div>
            </div>

            <div
              className="govuk-!-margin-top-4 govuk-!-padding-left-4"
              style={{ borderLeft: "4px solid #b1b4b6" }}
            >
              <h4 className="govuk-heading-s">Subcategories</h4>
              {subcategories.length === 0 ? (
                <p className="govuk-hint">
                  No subcategories. Officials can be assigned directly to this category.
                </p>
              ) : (
                <ol className="govuk-list govuk-list--number">
                  {subcategories.map((subcategory, subcategoryIndex) => (
                    <li
                      className="govuk-!-margin-bottom-4"
                      key={subcategory.id}
                      value={subcategoryIndex + 1}
                    >
                      <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-half">
                          <label
                            className="govuk-label"
                            htmlFor={`people-level-name-${subcategory.id}`}
                          >
                            Subcategory name
                          </label>
                          <input
                            className="govuk-input"
                            id={`people-level-name-${subcategory.id}`}
                            value={subcategory.name}
                            maxLength={100}
                            onChange={(event) =>
                              updateLevel(subcategory.id, { name: event.target.value })
                            }
                          />
                        </div>
                        <div className="govuk-grid-column-one-quarter">
                          <label
                            className="govuk-label"
                            htmlFor={`people-level-order-${subcategory.id}`}
                          >
                            Priority within category
                          </label>
                          <input
                            className="govuk-input govuk-input--width-5"
                            id={`people-level-order-${subcategory.id}`}
                            type="number"
                            min={1}
                            step={1}
                            value={subcategory.sort_order}
                            onChange={(event) =>
                              updateLevel(subcategory.id, {
                                sort_order: Number(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="govuk-grid-column-one-quarter govuk-!-padding-top-6">
                          <button
                            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                            type="button"
                            onClick={() => removeLevel(subcategory.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <button
                className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                type="button"
                onClick={() => addSubcategory(level.id)}
              >
                Add subcategory to {level.name || `category ${index + 1}`}
              </button>
            </div>
          </fieldset>
        );
      })}
      <button
        className="govuk-button govuk-button--secondary"
        type="button"
        onClick={addMainLevel}
      >
        Add category
      </button>

      <h3 className="govuk-heading-m govuk-!-margin-top-6">Current officials</h3>
      {!data.people.length ? (
        <p className="govuk-body">No current linked officials are recorded for this institution.</p>
      ) : (
        <div className="govuk-table__container">
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="col">Official and role</th>
                <th className="govuk-table__header" scope="col">Main category</th>
                <th className="govuk-table__header" scope="col">Subcategory (optional)</th>
                <th className="govuk-table__header" scope="col">Order in selected group</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {data.people.map((person) => {
                const assignedLevel = data.levels.find((level) => level.id === person.level_id);
                const selectedCategoryId = assignedLevel?.parent_level_id || assignedLevel?.id || "";
                const availableSubcategories = data.levels.filter(
                  (level) => level.parent_level_id === selectedCategoryId,
                );
                return <tr className="govuk-table__row" key={person.id}>
                  <th className="govuk-table__header" scope="row">
                    {person.name}
                    <span className="govuk-hint govuk-!-margin-bottom-0">{person.title}</span>
                    {person.priority != null && (
                      <span className="govuk-hint govuk-!-margin-bottom-0">
                        Existing position priority: {person.priority}
                      </span>
                    )}
                  </th>
                  <td className="govuk-table__cell">
                    <label className="govuk-visually-hidden" htmlFor={`person-category-${person.id}`}>
                      Main category for {person.name}
                    </label>
                    <select
                      className="govuk-select"
                      id={`person-category-${person.id}`}
                      value={selectedCategoryId}
                      onChange={(event) => {
                        const categoryId = event.target.value;
                        const existingLevel = data.levels.find((level) => level.id === person.level_id);
                        const keepOrder = existingLevel?.id === categoryId;
                        updatePerson(person.id, {
                          level_id: categoryId,
                          order: categoryId ? (keepOrder ? person.order : nextOrder(person.id, categoryId)) : "",
                        });
                      }}
                    >
                      <option value="">Automatic / not grouped</option>
                      {orderInstitutionPeopleLevels(data.levels)
                        .filter((level) => !level.parent_level_id)
                        .map((level) => (
                        <option value={level.id} key={level.id}>
                          {level.name || "Unnamed category"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="govuk-table__cell">
                    <label className="govuk-visually-hidden" htmlFor={`person-subcategory-${person.id}`}>
                      Subcategory for {person.name}
                    </label>
                    <select
                      className="govuk-select"
                      id={`person-subcategory-${person.id}`}
                      value={assignedLevel?.parent_level_id === selectedCategoryId ? assignedLevel.id : ""}
                      disabled={!selectedCategoryId}
                      onChange={(event) => {
                        const levelId = event.target.value || selectedCategoryId;
                        const keepOrder = person.level_id === levelId;
                        updatePerson(person.id, {
                          level_id: levelId,
                          order: keepOrder ? person.order : nextOrder(person.id, levelId),
                        });
                      }}
                    >
                      <option value="">No subcategory</option>
                      {availableSubcategories.map((subcategory) => (
                        <option value={subcategory.id} key={subcategory.id}>
                          {subcategory.name || "Unnamed subcategory"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="govuk-table__cell">
                    <label className="govuk-visually-hidden" htmlFor={`person-order-${person.id}`}>
                      Order within level for {person.name}
                    </label>
                    <input
                      className="govuk-input govuk-input--width-5"
                      id={`person-order-${person.id}`}
                      type="number"
                      min={1}
                      step={1}
                      value={person.order}
                      disabled={!person.level_id}
                      onChange={(event) => updatePerson(person.id, {
                        order: event.target.value === "" ? "" : Number(event.target.value),
                      })}
                    />
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="govuk-button"
        type="button"
        disabled={saving || !dirty}
        onClick={() => void save()}
      >
        {saving ? "Saving…" : "Save officials order"}
      </button>
      {dirty && !saving && <p className="govuk-hint">You have unsaved ordering changes.</p>}
    </section>
  );
}
