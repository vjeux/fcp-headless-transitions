__ZNK11PCTimeRange6getEndERK6CMTime:
0000000000067700	pushq	%rbp
0000000000067701	movq	%rsp, %rbp
0000000000067704	pushq	%r14
0000000000067706	pushq	%rbx
0000000000067707	subq	$0x90, %rsp
000000000006770e	movq	%rdx, %r14
0000000000067711	movq	%rdi, %rbx
0000000000067714	movq	0x10(%rsi), %rax
0000000000067718	movq	%rax, -0x20(%rbp)
000000000006771c	movups	(%rsi), %xmm0
000000000006771f	movaps	%xmm0, -0x30(%rbp)
0000000000067723	movq	0x28(%rsi), %rax
0000000000067727	movq	%rax, -0x40(%rbp)
000000000006772b	movups	0x18(%rsi), %xmm0
000000000006772f	movaps	%xmm0, -0x50(%rbp)
0000000000067733	movq	-0x40(%rbp), %rax
0000000000067737	movq	%rax, 0x28(%rsp)
000000000006773c	movaps	-0x50(%rbp), %xmm0
0000000000067740	movups	%xmm0, 0x18(%rsp)
0000000000067745	movq	-0x20(%rbp), %rax
0000000000067749	movq	%rax, 0x10(%rsp)
000000000006774e	movaps	-0x30(%rbp), %xmm0
0000000000067752	movups	%xmm0, (%rsp)
0000000000067756	leaq	-0x68(%rbp), %rdi
000000000006775a	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
000000000006775f	movq	0x10(%r14), %rax
0000000000067763	movq	%rax, -0x20(%rbp)
0000000000067767	movups	(%r14), %xmm0
000000000006776b	movaps	%xmm0, -0x30(%rbp)
000000000006776f	movq	-0x20(%rbp), %rax
0000000000067773	movq	%rax, 0x28(%rsp)
0000000000067778	movaps	-0x30(%rbp), %xmm0
000000000006777c	movups	%xmm0, 0x18(%rsp)
0000000000067781	movq	-0x58(%rbp), %rax
0000000000067785	movq	%rax, 0x10(%rsp)
000000000006778a	movups	-0x68(%rbp), %xmm0
000000000006778e	movups	%xmm0, (%rsp)
0000000000067792	movq	%rbx, %rdi
0000000000067795	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000006779a	movq	%rbx, %rax
000000000006779d	addq	$0x90, %rsp
00000000000677a4	popq	%rbx
00000000000677a5	popq	%r14
00000000000677a7	popq	%rbp
00000000000677a8	retq
00000000000677a9	nopl	(%rax)
