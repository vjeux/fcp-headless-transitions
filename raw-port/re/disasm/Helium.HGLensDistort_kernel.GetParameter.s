__ZN20HGLensDistort_kernel12GetParameterEiPf:
000000000022a5f0	cmpl	$0x3, %esi
000000000022a5f3	ja	0x22a6c1
000000000022a5f9	pushq	%rbp
000000000022a5fa	movq	%rsp, %rbp
000000000022a5fd	movl	%esi, %eax
000000000022a5ff	leaq	0xc2(%rip), %rcx
000000000022a606	movslq	(%rcx,%rax,4), %rax
000000000022a60a	addq	%rcx, %rax
000000000022a60d	jmpq	*%rax
000000000022a60f	movq	0x1f0(%rdi), %rax
000000000022a616	movss	(%rax), %xmm0
000000000022a61a	movss	%xmm0, (%rdx)
000000000022a61e	movss	0x4(%rax), %xmm0
000000000022a623	movss	%xmm0, 0x4(%rdx)
000000000022a628	movss	0x8(%rax), %xmm0
000000000022a62d	movss	%xmm0, 0x8(%rdx)
000000000022a632	addq	$0xc, %rax
000000000022a636	jmp	0x22a6b4
000000000022a638	movq	0x1f0(%rdi), %rax
000000000022a63f	movss	0x40(%rax), %xmm0
000000000022a644	movss	%xmm0, (%rdx)
000000000022a648	movss	0x44(%rax), %xmm0
000000000022a64d	movss	%xmm0, 0x4(%rdx)
000000000022a652	movss	0x48(%rax), %xmm0
000000000022a657	movss	%xmm0, 0x8(%rdx)
000000000022a65c	addq	$0x4c, %rax
000000000022a660	jmp	0x22a6b4
000000000022a662	movq	0x1f0(%rdi), %rax
000000000022a669	movss	0x60(%rax), %xmm0
000000000022a66e	movss	%xmm0, (%rdx)
000000000022a672	movss	0x64(%rax), %xmm0
000000000022a677	movss	%xmm0, 0x4(%rdx)
000000000022a67c	movss	0x68(%rax), %xmm0
000000000022a681	movss	%xmm0, 0x8(%rdx)
000000000022a686	addq	$0x6c, %rax
000000000022a68a	jmp	0x22a6b4
000000000022a68c	movq	0x1f0(%rdi), %rax
000000000022a693	movss	0x20(%rax), %xmm0
000000000022a698	movss	%xmm0, (%rdx)
000000000022a69c	movss	0x24(%rax), %xmm0
000000000022a6a1	movss	%xmm0, 0x4(%rdx)
000000000022a6a6	movss	0x28(%rax), %xmm0
000000000022a6ab	movss	%xmm0, 0x8(%rdx)
000000000022a6b0	addq	$0x2c, %rax
000000000022a6b4	movss	(%rax), %xmm0
000000000022a6b8	movss	%xmm0, 0xc(%rdx)
000000000022a6bd	xorl	%eax, %eax
000000000022a6bf	popq	%rbp
000000000022a6c0	retq
000000000022a6c1	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000022a6c6	retq
000000000022a6c7	nop
000000000022a6c8	.byte 0x47 #bad opcode
000000000022a6c9	.byte 0xff #bad opcode
000000000022a6ca	.byte 0xff #bad opcode
000000000022a6cb	incl	%esp
000000000022a6cd	.byte 0xff #bad opcode
000000000022a6ce	.byte 0xff #bad opcode
000000000022a6cf	pushq	-0x1(%rax)
000000000022a6d2	.byte 0xff #bad opcode
000000000022a6d3	lcalll	*0xfffffff(%rdx)
000000000022a6d9	.byte 0x1f #bad opcode
000000000022a6da	testb	%al, (%rax)
000000000022a6dc	addb	%al, (%rax)
000000000022a6de	addb	%al, (%rax)
