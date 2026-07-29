__ZNK12OZTimeMarkereqERKS_:
0000000000210970	pushq	%rbp
0000000000210971	movq	%rsp, %rbp
0000000000210974	pushq	%r14
0000000000210976	pushq	%rbx
0000000000210977	subq	$0x50, %rsp
000000000021097b	movq	%rsi, %rbx
000000000021097e	movq	%rdi, %r14
0000000000210981	movq	0x18(%rdi), %rax
0000000000210985	movq	%rax, -0x20(%rbp)
0000000000210989	movups	0x8(%rdi), %xmm0
000000000021098d	movaps	%xmm0, -0x30(%rbp)
0000000000210991	movq	0x18(%rsi), %rax
0000000000210995	movq	%rax, 0x28(%rsp)
000000000021099a	movups	0x8(%rsi), %xmm0
000000000021099e	movups	%xmm0, 0x18(%rsp)
00000000002109a3	movq	-0x20(%rbp), %rax
00000000002109a7	movq	%rax, 0x10(%rsp)
00000000002109ac	movaps	-0x30(%rbp), %xmm0
00000000002109b0	movups	%xmm0, (%rsp)
00000000002109b4	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000002109b9	testl	%eax, %eax
00000000002109bb	jne	0x210a31
00000000002109bd	movq	0x30(%r14), %rax
00000000002109c1	movq	%rax, -0x20(%rbp)
00000000002109c5	movups	0x20(%r14), %xmm0
00000000002109ca	movaps	%xmm0, -0x30(%rbp)
00000000002109ce	movq	0x30(%rbx), %rax
00000000002109d2	movq	%rax, 0x28(%rsp)
00000000002109d7	movups	0x20(%rbx), %xmm0
00000000002109db	movups	%xmm0, 0x18(%rsp)
00000000002109e0	movq	-0x20(%rbp), %rax
00000000002109e4	movq	%rax, 0x10(%rsp)
00000000002109e9	movaps	-0x30(%rbp), %xmm0
00000000002109ed	movups	%xmm0, (%rsp)
00000000002109f1	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000002109f6	testl	%eax, %eax
00000000002109f8	jne	0x210a31
00000000002109fa	leaq	0x38(%r14), %rdi
00000000002109fe	leaq	0x38(%rbx), %rsi
0000000000210a02	callq	0x6dfa50                        ## symbol stub for: __ZNK8PCString7compareERKS_
0000000000210a07	testl	%eax, %eax
0000000000210a09	jne	0x210a31
0000000000210a0b	leaq	0x40(%r14), %rdi
0000000000210a0f	leaq	0x40(%rbx), %rsi
0000000000210a13	callq	0x6dfa50                        ## symbol stub for: __ZNK8PCString7compareERKS_
0000000000210a18	testl	%eax, %eax
0000000000210a1a	jne	0x210a31
0000000000210a1c	movl	0x48(%r14), %eax
0000000000210a20	cmpl	0x48(%rbx), %eax
0000000000210a23	jne	0x210a31
0000000000210a25	movl	0x4c(%r14), %eax
0000000000210a29	cmpl	0x4c(%rbx), %eax
0000000000210a2c	sete	%al
0000000000210a2f	jmp	0x210a33
0000000000210a31	xorl	%eax, %eax
0000000000210a33	addq	$0x50, %rsp
0000000000210a37	popq	%rbx
0000000000210a38	popq	%r14
0000000000210a3a	popq	%rbp
0000000000210a3b	retq
0000000000210a3c	nopl	(%rax)
