__ZN22OZConstantInterpolator15getMinMaxValuesER8OZSplinePvS2_ddPdS3_:
0000000000043314	pushq	%rbp
0000000000043315	movq	%rsp, %rbp
0000000000043318	pushq	%r14
000000000004331a	pushq	%rbx
000000000004331b	movq	%r9, %rbx
000000000004331e	movq	%r8, %r14
0000000000043321	movq	%rdx, %rdi
0000000000043324	movq	(%rdx), %rax
0000000000043327	movq	0x87192(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
000000000004332e	callq	*0x18(%rax)
0000000000043331	movsd	%xmm0, (%r14)
0000000000043336	movsd	%xmm0, (%rbx)
000000000004333a	popq	%rbx
000000000004333b	popq	%r14
000000000004333d	popq	%rbp
000000000004333e	retq
000000000004333f	nop
