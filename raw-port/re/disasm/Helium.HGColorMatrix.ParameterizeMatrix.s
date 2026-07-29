__ZN13HGColorMatrix18ParameterizeMatrixEP10HGRenderer:
0000000000246d30	pushq	%rbp
0000000000246d31	movq	%rsp, %rbp
0000000000246d34	pushq	%rbx
0000000000246d35	pushq	%rax
0000000000246d36	movq	%rdi, %rbx
0000000000246d39	movq	%rsi, %rdi
0000000000246d3c	xorl	%esi, %esi
0000000000246d3e	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
0000000000246d43	movaps	0x1b0(%rbx), %xmm0
0000000000246d4a	movq	0x1a0(%rbx), %rcx
0000000000246d51	cmpl	$0x4700000, %eax                ## imm = 0x4700000
0000000000246d56	jb	0x246db4
0000000000246d58	movaps	%xmm0, 0x10(%rcx)
0000000000246d5c	movq	0x1a0(%rbx), %rax
0000000000246d63	movaps	%xmm0, (%rax)
0000000000246d66	movaps	0x1c0(%rbx), %xmm0
0000000000246d6d	movq	0x1a0(%rbx), %rax
0000000000246d74	movaps	%xmm0, 0x30(%rax)
0000000000246d78	movq	0x1a0(%rbx), %rax
0000000000246d7f	movaps	%xmm0, 0x20(%rax)
0000000000246d83	movaps	0x1d0(%rbx), %xmm0
0000000000246d8a	movq	0x1a0(%rbx), %rax
0000000000246d91	movaps	%xmm0, 0x50(%rax)
0000000000246d95	movq	0x1a0(%rbx), %rax
0000000000246d9c	movaps	%xmm0, 0x40(%rax)
0000000000246da0	movaps	0x1e0(%rbx), %xmm0
0000000000246da7	movq	0x1a0(%rbx), %rax
0000000000246dae	movaps	%xmm0, 0x70(%rax)
0000000000246db2	jmp	0x246de2
0000000000246db4	movaps	%xmm0, (%rcx)
0000000000246db7	movaps	0x1c0(%rbx), %xmm0
0000000000246dbe	movq	0x1a0(%rbx), %rax
0000000000246dc5	movaps	%xmm0, 0x20(%rax)
0000000000246dc9	movaps	0x1d0(%rbx), %xmm0
0000000000246dd0	movq	0x1a0(%rbx), %rax
0000000000246dd7	movaps	%xmm0, 0x40(%rax)
0000000000246ddb	movaps	0x1e0(%rbx), %xmm0
0000000000246de2	movq	0x1a0(%rbx), %rax
0000000000246de9	movaps	%xmm0, 0x60(%rax)
0000000000246ded	addq	$0x8, %rsp
0000000000246df1	popq	%rbx
0000000000246df2	popq	%rbp
0000000000246df3	retq
0000000000246df4	nopw	%cs:(%rax,%rax)
