import React, { useState } from "react";
import { useMemo } from "react";
import { evaluate, parse } from "./parser";

export default function App() {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  const parsed = useMemo(() => {
    setError(null);
    try {
      return evaluate(input ?? "");
    } catch (e) {
      setError(e);
      return null;
    }
  }, [input]);

  const { result, operands, universe } = parsed ?? {};

  // matrix that gets mirrored to alternating sides with each new operand
  const width = 2 ** Math.ceil(operands?.length / 2);
  const height = 2 ** Math.ceil((operands?.length - 1) / 2);

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      {error && <div>{error.message}</div>}
      {JSON.stringify({
        width,
        height,
      })}
      {operands?.length > 0 && (
        <table>
          <tbody>
            {Array.from({ length: height }).map((_, y) => (
              <tr
                key={y}
                style={{
                  height: `20px`,
                }}
              >
                {Array.from({ length: width }).map((_, x) => {
                  const index = x + y * width;
                  const assignment = universe[index];
                  const isInResult = result.includes(assignment);
                  return (
                    <td
                      key={index}
                      style={{
                        width: `20px`,
                        height: `20px`,
                        border: "1px solid black",
                        backgroundColor: isInResult ? "red" : "white",
                      }}
                    ></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
