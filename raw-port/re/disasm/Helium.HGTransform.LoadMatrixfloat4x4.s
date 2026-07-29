__ZN11HGTransform18LoadMatrixfloat4x4EPKN4simd8float4x4E:
00000000001b45f0	pushq	%rbp
00000000001b45f1	movq	%rsp, %rbp
00000000001b45f4	subq	$0x50, %rsp
00000000001b45f8	movq	0x84dc59(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001b45ff	movq	(%rax), %rax
00000000001b4602	movq	%rax, -0x8(%rbp)
00000000001b4606	movaps	(%rsi), %xmm0
00000000001b4609	movaps	%xmm0, -0x50(%rbp)
00000000001b460d	movaps	0x10(%rsi), %xmm0
00000000001b4611	movaps	%xmm0, -0x40(%rbp)
00000000001b4615	movaps	0x20(%rsi), %xmm0
00000000001b4619	movaps	%xmm0, -0x30(%rbp)
00000000001b461d	movaps	0x30(%rsi), %xmm0
00000000001b4621	movaps	%xmm0, -0x20(%rbp)
00000000001b4625	movq	(%rdi), %rax
00000000001b4628	leaq	-0x50(%rbp), %rsi
00000000001b462c	callq	*0x40(%rax)
00000000001b462f	movq	0x84dc22(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001b4636	movq	(%rax), %rax
00000000001b4639	cmpq	-0x8(%rbp), %rax
00000000001b463d	jne	0x1b4645
00000000001b463f	addq	$0x50, %rsp
00000000001b4643	popq	%rbp
00000000001b4644	retq
00000000001b4645	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001b464a	nopw	(%rax,%rax)
