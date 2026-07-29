__ZN11HGTransform19LoadMatrixdouble4x4EPKN4simd9double4x4E:
00000000001b4650	pushq	%rbp
00000000001b4651	movq	%rsp, %rbp
00000000001b4654	subq	$0x90, %rsp
00000000001b465b	movq	0x84dbf6(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001b4662	movq	(%rax), %rax
00000000001b4665	movq	%rax, -0x8(%rbp)
00000000001b4669	movaps	(%rsi), %xmm0
00000000001b466c	movaps	0x10(%rsi), %xmm1
00000000001b4670	movaps	%xmm0, -0x90(%rbp)
00000000001b4677	movaps	%xmm1, -0x80(%rbp)
00000000001b467b	movaps	0x20(%rsi), %xmm0
00000000001b467f	movaps	0x30(%rsi), %xmm1
00000000001b4683	movaps	%xmm0, -0x70(%rbp)
00000000001b4687	movaps	%xmm1, -0x60(%rbp)
00000000001b468b	movaps	0x40(%rsi), %xmm0
00000000001b468f	movaps	0x50(%rsi), %xmm1
00000000001b4693	movaps	%xmm0, -0x50(%rbp)
00000000001b4697	movaps	%xmm1, -0x40(%rbp)
00000000001b469b	movaps	0x60(%rsi), %xmm0
00000000001b469f	movaps	0x70(%rsi), %xmm1
00000000001b46a3	movaps	%xmm0, -0x30(%rbp)
00000000001b46a7	movaps	%xmm1, -0x20(%rbp)
00000000001b46ab	movq	(%rdi), %rax
00000000001b46ae	leaq	-0x90(%rbp), %rsi
00000000001b46b5	callq	*0x48(%rax)
00000000001b46b8	movq	0x84db99(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001b46bf	movq	(%rax), %rax
00000000001b46c2	cmpq	-0x8(%rbp), %rax
00000000001b46c6	jne	0x1b46d1
00000000001b46c8	addq	$0x90, %rsp
00000000001b46cf	popq	%rbp
00000000001b46d0	retq
00000000001b46d1	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001b46d6	nopw	%cs:(%rax,%rax)
