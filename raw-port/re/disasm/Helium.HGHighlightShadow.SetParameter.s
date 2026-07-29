__ZN17HGHighlightShadow12SetParameterEiffff:
000000000014d340	cmpl	$0x7, %esi
000000000014d343	ja	0x14d454
000000000014d349	movl	%esi, %eax
000000000014d34b	leaq	0x10a(%rip), %rcx
000000000014d352	movslq	(%rcx,%rax,4), %rax
000000000014d356	addq	%rcx, %rax
000000000014d359	jmpq	*%rax
000000000014d35b	movss	0x1dc(%rdi), %xmm1
000000000014d363	ucomiss	%xmm0, %xmm1
000000000014d366	jne	0x14d36e
000000000014d368	jnp	0x14d451
000000000014d36e	movss	%xmm0, 0x1dc(%rdi)
000000000014d376	jmp	0x14d437
000000000014d37b	movss	0x1ec(%rdi), %xmm1
000000000014d383	ucomiss	%xmm0, %xmm1
000000000014d386	jne	0x14d38e
000000000014d388	jnp	0x14d451
000000000014d38e	movss	%xmm0, 0x1ec(%rdi)
000000000014d396	jmp	0x14d437
000000000014d39b	movss	0x1e4(%rdi), %xmm1
000000000014d3a3	ucomiss	%xmm0, %xmm1
000000000014d3a6	jne	0x14d3ae
000000000014d3a8	jnp	0x14d451
000000000014d3ae	movss	%xmm0, 0x1e4(%rdi)
000000000014d3b6	jmp	0x14d437
000000000014d3b8	movss	0x1e8(%rdi), %xmm1
000000000014d3c0	ucomiss	%xmm0, %xmm1
000000000014d3c3	jne	0x14d3cb
000000000014d3c5	jnp	0x14d451
000000000014d3cb	movss	%xmm0, 0x1e8(%rdi)
000000000014d3d3	jmp	0x14d437
000000000014d3d5	movss	0x1f8(%rdi), %xmm1
000000000014d3dd	ucomiss	%xmm0, %xmm1
000000000014d3e0	jne	0x14d3e4
000000000014d3e2	jnp	0x14d451
000000000014d3e4	movss	%xmm0, 0x1f8(%rdi)
000000000014d3ec	jmp	0x14d437
000000000014d3ee	movss	0x1e0(%rdi), %xmm1
000000000014d3f6	ucomiss	%xmm0, %xmm1
000000000014d3f9	jne	0x14d3fd
000000000014d3fb	jnp	0x14d451
000000000014d3fd	movss	%xmm0, 0x1e0(%rdi)
000000000014d405	jmp	0x14d437
000000000014d407	movss	0x1f0(%rdi), %xmm1
000000000014d40f	ucomiss	%xmm0, %xmm1
000000000014d412	jne	0x14d416
000000000014d414	jnp	0x14d451
000000000014d416	movss	%xmm0, 0x1f0(%rdi)
000000000014d41e	jmp	0x14d437
000000000014d420	movss	0x1f4(%rdi), %xmm1
000000000014d428	ucomiss	%xmm0, %xmm1
000000000014d42b	jne	0x14d42f
000000000014d42d	jnp	0x14d451
000000000014d42f	movss	%xmm0, 0x1f4(%rdi)
000000000014d437	pushq	%rbp
000000000014d438	movq	%rsp, %rbp
000000000014d43b	movl	$0x1, 0x1d8(%rdi)
000000000014d445	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
000000000014d44a	movl	$0x1, %eax
000000000014d44f	popq	%rbp
000000000014d450	retq
000000000014d451	xorl	%eax, %eax
000000000014d453	retq
000000000014d454	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000014d459	retq
000000000014d45a	nop
000000000014d45c	.byte 0xff #bad opcode
000000000014d45d	.byte 0xfe #bad opcode
000000000014d45e	.byte 0xff #bad opcode
000000000014d45f	callq	*0x3fffffff(%rdx)
000000000014d465	.byte 0xff #bad opcode
000000000014d466	.byte 0xff #bad opcode
000000000014d467	lcalll	*-0x1(%rdi,%rdi,8)
000000000014d46b	lcalll	*(%rdi)
000000000014d46d	.byte 0xff #bad opcode
000000000014d46e	.byte 0xff #bad opcode
000000000014d46f	ljmpl	*-0x3b000001(%rbx)
000000000014d475	.byte 0xff #bad opcode
000000000014d476	.byte 0xff #bad opcode
000000000014d477	.byte 0xff #bad opcode
000000000014d478	jns	0x14d479
000000000014d47a	.byte 0xff #bad opcode
000000000014d47b	decl	(%rdi)
000000000014d47d	.byte 0x1f #bad opcode
000000000014d47e	addb	%dl, 0x48(%rbp)
000000000014d482	movl	%esp, %ebp
000000000014d484	pushq	%r14
000000000014d486	pushq	%rbx
000000000014d487	subq	$0xf0, %rsp
000000000014d48e	movq	%rdi, %rbx
000000000014d491	movq	%rsi, %rdi
000000000014d494	movq	%rbx, %rsi
000000000014d497	xorl	%edx, %edx
000000000014d499	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000014d49e	movq	%rax, %r14
000000000014d4a1	movss	0x1dc(%rbx), %xmm2
000000000014d4a9	movss	0x27a80f(%rip), %xmm0
000000000014d4b1	ucomiss	%xmm2, %xmm0
000000000014d4b4	jb	0x14d4c3
000000000014d4b6	ucomiss	0x1e4(%rbx), %xmm0
000000000014d4bd	jae	0x14dc84
000000000014d4c3	cmpl	$0x0, 0x1d8(%rbx)
000000000014d4ca	je	0x14dc35
000000000014d4d0	movl	$0x0, 0x1d8(%rbx)
000000000014d4da	movss	0x1e0(%rbx), %xmm0
000000000014d4e2	movss	0x1e4(%rbx), %xmm1
000000000014d4ea	movss	%xmm1, -0x14(%rbp)
000000000014d4ef	movss	0x1e8(%rbx), %xmm1
000000000014d4f7	movss	%xmm1, -0x60(%rbp)
000000000014d4fc	movss	0x1ec(%rbx), %xmm1
000000000014d504	movss	%xmm1, -0x28(%rbp)
000000000014d509	movss	0x1f0(%rbx), %xmm1
000000000014d511	movss	%xmm1, -0x90(%rbp)
000000000014d519	movss	0x1f4(%rbx), %xmm1
000000000014d521	movss	%xmm1, -0x24(%rbp)
000000000014d526	leaq	-0xd8(%rbp), %rdi
000000000014d52d	movaps	%xmm2, %xmm1
000000000014d530	movss	%xmm2, -0x20(%rbp)
000000000014d535	callq	__ZL11getSettingsffP8settings   ## getSettings(float, float, settings*)
000000000014d53a	leaq	-0xc4(%rbp), %rdi
000000000014d541	movss	-0x60(%rbp), %xmm0
000000000014d546	movss	-0x14(%rbp), %xmm1
000000000014d54b	callq	__ZL11getSettingsffP8settings   ## getSettings(float, float, settings*)
000000000014d550	movss	-0xd4(%rbp), %xmm0
000000000014d558	xorps	%xmm1, %xmm1
000000000014d55b	cvtss2sd	%xmm0, %xmm1
000000000014d55f	movaps	%xmm1, -0x80(%rbp)
000000000014d563	movss	-0xd8(%rbp), %xmm0
000000000014d56b	movss	%xmm0, -0x18(%rbp)
000000000014d570	movss	-0xc0(%rbp), %xmm0
000000000014d578	cvtss2sd	%xmm0, %xmm0
000000000014d57c	movaps	%xmm0, -0x60(%rbp)
000000000014d580	movss	-0xc4(%rbp), %xmm0
000000000014d588	movss	%xmm0, -0x1c(%rbp)
000000000014d58d	movaps	%xmm1, %xmm0
000000000014d590	xorps	0x27d549(%rip), %xmm0
000000000014d597	callq	0x3c50ea                        ## symbol stub for: _exp
000000000014d59c	movaps	%xmm0, -0x70(%rbp)
000000000014d5a0	movapd	-0x60(%rbp), %xmm0
000000000014d5a5	xorpd	0x27d533(%rip), %xmm0
000000000014d5ad	callq	0x3c50ea                        ## symbol stub for: _exp
000000000014d5b2	movss	-0xc8(%rbp), %xmm2
000000000014d5ba	movsd	0x70ba7e(%rip), %xmm1
000000000014d5c2	movapd	-0x80(%rbp), %xmm3
000000000014d5c7	divsd	%xmm1, %xmm3
000000000014d5cb	movapd	%xmm3, -0x80(%rbp)
000000000014d5d0	movapd	-0x60(%rbp), %xmm3
000000000014d5d5	divsd	%xmm1, %xmm3
000000000014d5d9	movapd	%xmm3, -0x60(%rbp)
000000000014d5de	movss	0x27cd0a(%rip), %xmm6
000000000014d5e6	movaps	%xmm2, %xmm3
000000000014d5e9	movaps	%xmm2, %xmm14
000000000014d5ed	addss	%xmm6, %xmm3
000000000014d5f1	movaps	0x27cad8(%rip), %xmm1
000000000014d5f8	xorps	%xmm1, %xmm3
000000000014d5fb	movaps	%xmm3, -0xb0(%rbp)
000000000014d602	movss	-0xb4(%rbp), %xmm2
000000000014d60a	movaps	%xmm2, %xmm3
000000000014d60d	movaps	%xmm2, %xmm15
000000000014d611	addss	%xmm6, %xmm3
000000000014d615	xorps	%xmm1, %xmm3
000000000014d618	movaps	%xmm3, -0xa0(%rbp)
000000000014d61f	movsd	0x27cc38(%rip), %xmm10
000000000014d628	movapd	%xmm10, %xmm2
000000000014d62d	movapd	-0x70(%rbp), %xmm3
000000000014d632	subsd	%xmm3, %xmm2
000000000014d636	movapd	%xmm10, %xmm1
000000000014d63b	divsd	%xmm2, %xmm1
000000000014d63f	movapd	0x27d499(%rip), %xmm5
000000000014d647	xorpd	%xmm5, %xmm3
000000000014d64b	divsd	%xmm2, %xmm3
000000000014d64f	movapd	%xmm3, -0x70(%rbp)
000000000014d654	movapd	%xmm10, %xmm4
000000000014d659	subsd	%xmm0, %xmm4
000000000014d65d	cvtps2pd	-0xd0(%rbp), %xmm2
000000000014d664	movapd	%xmm2, %xmm7
000000000014d668	unpckhpd	%xmm2, %xmm7                    ## xmm7 = xmm7[1],xmm2[1]
000000000014d66c	subsd	%xmm2, %xmm7
000000000014d670	xorpd	%xmm5, %xmm2
000000000014d674	cvtps2pd	-0xbc(%rbp), %xmm3
000000000014d67b	movapd	%xmm3, %xmm11
000000000014d680	unpckhpd	%xmm3, %xmm11                   ## xmm11 = xmm11[1],xmm3[1]
000000000014d685	subsd	%xmm3, %xmm11
000000000014d68a	xorpd	%xmm5, %xmm3
000000000014d68e	xorpd	%xmm5, %xmm0
000000000014d692	movapd	%xmm10, %xmm5
000000000014d697	divsd	%xmm4, %xmm5
000000000014d69b	divsd	%xmm4, %xmm0
000000000014d69f	divsd	%xmm7, %xmm2
000000000014d6a3	movapd	%xmm10, %xmm4
000000000014d6a8	divsd	%xmm7, %xmm4
000000000014d6ac	movss	-0x20(%rbp), %xmm7
000000000014d6b1	cvtss2sd	%xmm7, %xmm8
000000000014d6b6	movsd	0x28b3b9(%rip), %xmm12
000000000014d6bf	mulsd	%xmm12, %xmm8
000000000014d6c4	movss	-0x18(%rbp), %xmm7
000000000014d6c9	cvtss2sd	%xmm7, %xmm7
000000000014d6cd	mulsd	%xmm8, %xmm7
000000000014d6d2	movss	-0x14(%rbp), %xmm8
000000000014d6d8	cvtss2sd	%xmm8, %xmm13
000000000014d6dd	mulsd	%xmm12, %xmm13
000000000014d6e2	movss	-0x1c(%rbp), %xmm8
000000000014d6e8	cvtss2sd	%xmm8, %xmm8
000000000014d6ed	movss	-0x24(%rbp), %xmm9
000000000014d6f3	cvtss2sd	%xmm9, %xmm9
000000000014d6f8	mulsd	%xmm13, %xmm8
000000000014d6fd	mulsd	%xmm12, %xmm9
000000000014d702	addsd	%xmm10, %xmm7
000000000014d707	addsd	%xmm10, %xmm8
000000000014d70c	addsd	%xmm10, %xmm9
000000000014d711	divsd	%xmm11, %xmm3
000000000014d716	divsd	%xmm11, %xmm10
000000000014d71b	movss	-0x28(%rbp), %xmm13
000000000014d721	movaps	%xmm13, %xmm11
000000000014d725	divss	%xmm6, %xmm11
000000000014d72a	movss	0x27d859(%rip), %xmm12
000000000014d733	addss	%xmm12, %xmm14
000000000014d738	movss	%xmm14, -0x14(%rbp)
000000000014d73e	divss	0x27e9fd(%rip), %xmm13
000000000014d747	movaps	%xmm13, %xmm14
000000000014d74b	cvtss2sd	%xmm11, %xmm6
000000000014d750	addss	%xmm12, %xmm15
000000000014d755	movss	%xmm15, -0x28(%rbp)
000000000014d75b	xorps	%xmm11, %xmm11
000000000014d75f	mulsd	%xmm6, %xmm11
000000000014d764	movsd	0x28b2fb(%rip), %xmm13
000000000014d76d	mulsd	%xmm13, %xmm11
000000000014d772	movapd	%xmm6, %xmm12
000000000014d777	mulsd	%xmm13, %xmm12
000000000014d77c	addsd	%xmm6, %xmm6
000000000014d780	mulsd	%xmm13, %xmm6
000000000014d785	minss	0x27a532(%rip), %xmm14
000000000014d78e	xorps	%xmm13, %xmm13
000000000014d792	cvtss2sd	%xmm14, %xmm13
000000000014d797	addsd	%xmm13, %xmm13
000000000014d79c	addsd	%xmm13, %xmm11
000000000014d7a1	addsd	%xmm13, %xmm12
000000000014d7a6	addsd	%xmm13, %xmm6
000000000014d7ab	xorps	%xmm13, %xmm13
000000000014d7af	cvtsd2ss	%xmm1, %xmm13
000000000014d7b4	movss	%xmm13, -0x44(%rbp)
000000000014d7ba	cvtsd2ss	%xmm5, %xmm5
000000000014d7be	movss	%xmm5, -0x40(%rbp)
000000000014d7c3	movaps	-0x80(%rbp), %xmm1
000000000014d7c7	xorps	%xmm14, %xmm14
000000000014d7cb	cvtsd2ss	%xmm1, %xmm14
000000000014d7d0	movss	%xmm14, -0x3c(%rbp)
000000000014d7d6	movaps	-0x60(%rbp), %xmm1
000000000014d7da	xorps	%xmm15, %xmm15
000000000014d7de	cvtsd2ss	%xmm1, %xmm15
000000000014d7e3	movss	%xmm15, -0x38(%rbp)
000000000014d7e9	xorps	%xmm1, %xmm1
000000000014d7ec	cvtsd2ss	%xmm2, %xmm1
000000000014d7f0	movss	%xmm1, -0x30(%rbp)
000000000014d7f5	xorps	%xmm1, %xmm1
000000000014d7f8	cvtsd2ss	%xmm3, %xmm1
000000000014d7fc	movss	%xmm1, -0x2c(%rbp)
000000000014d801	movaps	-0x70(%rbp), %xmm1
000000000014d805	cvtsd2ss	%xmm1, %xmm1
000000000014d809	movss	%xmm1, -0x20(%rbp)
000000000014d80e	cvtsd2ss	%xmm0, %xmm0
000000000014d812	movss	%xmm0, -0x1c(%rbp)
000000000014d817	xorps	%xmm0, %xmm0
000000000014d81a	cvtsd2ss	%xmm4, %xmm0
000000000014d81e	movss	%xmm0, -0x18(%rbp)
000000000014d823	xorps	%xmm0, %xmm0
000000000014d826	cvtsd2ss	%xmm10, %xmm0
000000000014d82b	movss	%xmm0, -0x34(%rbp)
000000000014d830	xorps	%xmm0, %xmm0
000000000014d833	cvtsd2ss	%xmm7, %xmm0
000000000014d837	movss	%xmm0, -0x70(%rbp)
000000000014d83c	xorps	%xmm0, %xmm0
000000000014d83f	cvtsd2ss	%xmm8, %xmm0
000000000014d844	movss	%xmm0, -0x24(%rbp)
000000000014d849	xorps	%xmm0, %xmm0
000000000014d84c	cvtsd2ss	%xmm9, %xmm0
000000000014d851	movss	%xmm0, -0x60(%rbp)
000000000014d856	movss	-0x90(%rbp), %xmm0
000000000014d85e	cvtss2sd	%xmm0, %xmm0
000000000014d862	addsd	0x27fa0e(%rip), %xmm0
000000000014d86a	mulsd	0x2836ae(%rip), %xmm0
000000000014d872	cvtsd2ss	%xmm0, %xmm0
000000000014d876	movss	%xmm0, -0x80(%rbp)
000000000014d87b	movsd	0x70b7c5(%rip), %xmm0
000000000014d883	addsd	%xmm0, %xmm11
000000000014d888	xorps	%xmm1, %xmm1
000000000014d88b	roundsd	$0x9, %xmm11, %xmm1
000000000014d892	cvttpd2dq	%xmm1, %xmm1
000000000014d896	addsd	%xmm0, %xmm12
000000000014d89b	addsd	%xmm0, %xmm6
000000000014d89f	xorps	%xmm0, %xmm0
000000000014d8a2	roundsd	$0x9, %xmm12, %xmm0
000000000014d8a9	cvttpd2dq	%xmm0, %xmm0
000000000014d8ad	cvtdq2ps	%xmm1, %xmm1
000000000014d8b0	movaps	%xmm1, -0xf0(%rbp)
000000000014d8b7	xorps	%xmm1, %xmm1
000000000014d8ba	roundsd	$0x9, %xmm6, %xmm1
000000000014d8c0	cvttpd2dq	%xmm1, %xmm1
000000000014d8c4	cvtdq2ps	%xmm0, %xmm0
000000000014d8c7	movaps	%xmm0, -0x100(%rbp)
000000000014d8ce	cvtdq2ps	%xmm1, %xmm0
000000000014d8d1	movaps	%xmm0, -0x90(%rbp)
000000000014d8d8	movq	0x198(%rbx), %rdi
000000000014d8df	movq	(%rdi), %rax
000000000014d8e2	xorl	%esi, %esi
000000000014d8e4	movaps	%xmm13, %xmm0
000000000014d8e8	movaps	%xmm5, %xmm1
000000000014d8eb	movaps	%xmm14, %xmm2
000000000014d8ef	movaps	%xmm15, %xmm3
000000000014d8f3	callq	*0x60(%rax)
000000000014d8f6	movq	0x1a0(%rbx), %rdi
000000000014d8fd	movq	(%rdi), %rax
000000000014d900	xorl	%esi, %esi
000000000014d902	movss	-0x44(%rbp), %xmm0
000000000014d907	movss	-0x40(%rbp), %xmm1
000000000014d90c	movss	-0x3c(%rbp), %xmm2
000000000014d911	movss	-0x38(%rbp), %xmm3
000000000014d916	callq	*0x60(%rax)
000000000014d919	movq	0x1a8(%rbx), %rdi
000000000014d920	movq	(%rdi), %rax
000000000014d923	xorl	%esi, %esi
000000000014d925	movss	-0x44(%rbp), %xmm0
000000000014d92a	movss	-0x40(%rbp), %xmm1
000000000014d92f	movss	-0x3c(%rbp), %xmm2
000000000014d934	movss	-0x38(%rbp), %xmm3
000000000014d939	callq	*0x60(%rax)
000000000014d93c	movq	0x198(%rbx), %rdi
000000000014d943	movq	(%rdi), %rax
000000000014d946	movl	$0x1, %esi
000000000014d94b	movss	-0x30(%rbp), %xmm0
000000000014d950	movss	-0x2c(%rbp), %xmm1
000000000014d955	movaps	-0xb0(%rbp), %xmm2
000000000014d95c	movaps	-0xa0(%rbp), %xmm3
000000000014d963	callq	*0x60(%rax)
000000000014d966	movq	0x1a0(%rbx), %rdi
000000000014d96d	movq	(%rdi), %rax
000000000014d970	movl	$0x1, %esi
000000000014d975	movss	-0x30(%rbp), %xmm0
000000000014d97a	movss	-0x2c(%rbp), %xmm1
000000000014d97f	movaps	-0xb0(%rbp), %xmm2
000000000014d986	movaps	-0xa0(%rbp), %xmm3
000000000014d98d	callq	*0x60(%rax)
000000000014d990	movq	0x1a8(%rbx), %rdi
000000000014d997	movq	(%rdi), %rax
000000000014d99a	movl	$0x1, %esi
000000000014d99f	movss	-0x30(%rbp), %xmm0
000000000014d9a4	movss	-0x2c(%rbp), %xmm1
000000000014d9a9	movaps	-0xb0(%rbp), %xmm2
000000000014d9b0	movaps	-0xa0(%rbp), %xmm3
000000000014d9b7	callq	*0x60(%rax)
000000000014d9ba	movq	0x198(%rbx), %rdi
000000000014d9c1	movq	(%rdi), %rax
000000000014d9c4	movl	$0x2, %esi
000000000014d9c9	movss	-0x20(%rbp), %xmm0
000000000014d9ce	movss	-0x1c(%rbp), %xmm1
000000000014d9d3	movss	-0x18(%rbp), %xmm2
000000000014d9d8	movss	-0x34(%rbp), %xmm3
000000000014d9dd	callq	*0x60(%rax)
000000000014d9e0	movq	0x1a0(%rbx), %rdi
000000000014d9e7	movq	(%rdi), %rax
000000000014d9ea	movl	$0x2, %esi
000000000014d9ef	movss	-0x20(%rbp), %xmm0
000000000014d9f4	movss	-0x1c(%rbp), %xmm1
000000000014d9f9	movss	-0x18(%rbp), %xmm2
000000000014d9fe	movss	-0x34(%rbp), %xmm3
000000000014da03	callq	*0x60(%rax)
000000000014da06	movq	0x1a8(%rbx), %rdi
000000000014da0d	movq	(%rdi), %rax
000000000014da10	movl	$0x2, %esi
000000000014da15	movss	-0x20(%rbp), %xmm0
000000000014da1a	movss	-0x1c(%rbp), %xmm1
000000000014da1f	movss	-0x18(%rbp), %xmm2
000000000014da24	movss	-0x34(%rbp), %xmm3
000000000014da29	callq	*0x60(%rax)
000000000014da2c	movq	0x198(%rbx), %rdi
000000000014da33	movq	(%rdi), %rax
000000000014da36	movl	$0x3, %esi
000000000014da3b	movss	-0x14(%rbp), %xmm0
000000000014da40	movss	-0x28(%rbp), %xmm1
000000000014da45	movss	-0x70(%rbp), %xmm2
000000000014da4a	movss	-0x24(%rbp), %xmm3
000000000014da4f	callq	*0x60(%rax)
000000000014da52	movq	0x1a0(%rbx), %rdi
000000000014da59	movq	(%rdi), %rax
000000000014da5c	movl	$0x3, %esi
000000000014da61	movss	-0x14(%rbp), %xmm0
000000000014da66	movss	-0x28(%rbp), %xmm1
000000000014da6b	movss	-0x70(%rbp), %xmm2
000000000014da70	movss	-0x24(%rbp), %xmm3
000000000014da75	callq	*0x60(%rax)
000000000014da78	movq	0x1a8(%rbx), %rdi
000000000014da7f	movq	(%rdi), %rax
000000000014da82	movl	$0x3, %esi
000000000014da87	movss	-0x14(%rbp), %xmm0
000000000014da8c	movss	-0x28(%rbp), %xmm1
000000000014da91	movss	-0x70(%rbp), %xmm2
000000000014da96	movss	-0x24(%rbp), %xmm3
000000000014da9b	callq	*0x60(%rax)
000000000014da9e	movq	0x198(%rbx), %rdi
000000000014daa5	movq	(%rdi), %rax
000000000014daa8	movl	$0x4, %esi
000000000014daad	movss	-0x60(%rbp), %xmm0
000000000014dab2	movss	-0x80(%rbp), %xmm1
000000000014dab7	callq	*0x60(%rax)
000000000014daba	movq	0x1a0(%rbx), %rdi
000000000014dac1	movq	(%rdi), %rax
000000000014dac4	movl	$0x4, %esi
000000000014dac9	movss	-0x60(%rbp), %xmm0
000000000014dace	movss	-0x80(%rbp), %xmm1
000000000014dad3	callq	*0x60(%rax)
000000000014dad6	movq	0x1a8(%rbx), %rdi
000000000014dadd	movq	(%rdi), %rax
000000000014dae0	movl	$0x4, %esi
000000000014dae5	movss	-0x60(%rbp), %xmm0
000000000014daea	movss	-0x80(%rbp), %xmm1
000000000014daef	callq	*0x60(%rax)
000000000014daf2	movq	0x198(%rbx), %rdi
000000000014daf9	movss	0x27a1bf(%rip), %xmm3
000000000014db01	movaps	%xmm3, %xmm0
000000000014db04	divss	0x1f8(%rbx), %xmm0
000000000014db0c	movq	(%rdi), %rax
000000000014db0f	movl	$0x5, %esi
000000000014db14	movaps	%xmm0, %xmm1
000000000014db17	movaps	%xmm0, %xmm2
000000000014db1a	callq	*0x60(%rax)
000000000014db1d	movq	0x1a0(%rbx), %rdi
000000000014db24	movss	0x27a194(%rip), %xmm3
000000000014db2c	movaps	%xmm3, %xmm0
000000000014db2f	divss	0x1f8(%rbx), %xmm0
000000000014db37	movq	(%rdi), %rax
000000000014db3a	movl	$0x5, %esi
000000000014db3f	movaps	%xmm0, %xmm1
000000000014db42	movaps	%xmm0, %xmm2
000000000014db45	callq	*0x60(%rax)
000000000014db48	movq	0x1a8(%rbx), %rdi
000000000014db4f	movss	0x27a169(%rip), %xmm3
000000000014db57	movaps	%xmm3, %xmm0
000000000014db5a	divss	0x1f8(%rbx), %xmm0
000000000014db62	movq	(%rdi), %rax
000000000014db65	movl	$0x5, %esi
000000000014db6a	movaps	%xmm0, %xmm1
000000000014db6d	movaps	%xmm0, %xmm2
000000000014db70	callq	*0x60(%rax)
000000000014db73	movq	0x1b0(%rbx), %rdi
000000000014db7a	movaps	-0xf0(%rbp), %xmm0
000000000014db81	mulss	0x281acf(%rip), %xmm0
000000000014db89	movq	(%rdi), %rax
000000000014db8c	xorps	%xmm2, %xmm2
000000000014db8f	xorps	%xmm3, %xmm3
000000000014db92	xorl	%esi, %esi
000000000014db94	movaps	%xmm0, %xmm1
000000000014db97	callq	*0x60(%rax)
000000000014db9a	movq	0x1b8(%rbx), %rdi
000000000014dba1	movaps	-0x100(%rbp), %xmm0
000000000014dba8	mulss	0x281aa8(%rip), %xmm0
000000000014dbb0	movq	(%rdi), %rax
000000000014dbb3	xorps	%xmm2, %xmm2
000000000014dbb6	xorps	%xmm3, %xmm3
000000000014dbb9	xorl	%esi, %esi
000000000014dbbb	movaps	%xmm0, %xmm1
000000000014dbbe	callq	*0x60(%rax)
000000000014dbc1	movq	0x1c0(%rbx), %rdi
000000000014dbc8	movaps	-0x90(%rbp), %xmm0
000000000014dbcf	mulss	0x281a81(%rip), %xmm0
000000000014dbd7	movq	(%rdi), %rax
000000000014dbda	xorps	%xmm2, %xmm2
000000000014dbdd	xorps	%xmm3, %xmm3
000000000014dbe0	xorl	%esi, %esi
000000000014dbe2	movaps	%xmm0, %xmm1
000000000014dbe5	callq	*0x60(%rax)
000000000014dbe8	movq	0x1c8(%rbx), %rdi
000000000014dbef	movss	0x27a0c9(%rip), %xmm3
000000000014dbf7	movaps	%xmm3, %xmm0
000000000014dbfa	divss	0x1f8(%rbx), %xmm0
000000000014dc02	movq	(%rdi), %rax
000000000014dc05	xorl	%esi, %esi
000000000014dc07	movaps	%xmm0, %xmm1
000000000014dc0a	movaps	%xmm0, %xmm2
000000000014dc0d	callq	*0x60(%rax)
000000000014dc10	movq	0x1d0(%rbx), %rdi
000000000014dc17	movss	0x1f8(%rbx), %xmm0
000000000014dc1f	movq	(%rdi), %rax
000000000014dc22	xorl	%esi, %esi
000000000014dc24	movaps	%xmm0, %xmm1
000000000014dc27	movaps	%xmm0, %xmm2
000000000014dc2a	movss	0x27a08e(%rip), %xmm3
000000000014dc32	callq	*0x60(%rax)
000000000014dc35	movq	0x1c8(%rbx), %rdi
000000000014dc3c	movq	(%rdi), %rax
000000000014dc3f	xorl	%esi, %esi
000000000014dc41	movq	%r14, %rdx
000000000014dc44	callq	*0x78(%rax)
000000000014dc47	movq	0x1b0(%rbx), %rdi
000000000014dc4e	movq	(%rdi), %rax
000000000014dc51	xorl	%esi, %esi
000000000014dc53	movq	%r14, %rdx
000000000014dc56	callq	*0x78(%rax)
000000000014dc59	movq	0x1b8(%rbx), %rdi
000000000014dc60	movq	(%rdi), %rax
000000000014dc63	xorl	%esi, %esi
000000000014dc65	movq	%r14, %rdx
000000000014dc68	callq	*0x78(%rax)
000000000014dc6b	movq	0x1c0(%rbx), %rdi
000000000014dc72	movq	(%rdi), %rax
000000000014dc75	xorl	%esi, %esi
000000000014dc77	movq	%r14, %rdx
000000000014dc7a	callq	*0x78(%rax)
000000000014dc7d	movq	0x1d0(%rbx), %r14
000000000014dc84	movq	%r14, %rax
000000000014dc87	addq	$0xf0, %rsp
000000000014dc8e	popq	%rbx
000000000014dc8f	popq	%r14
000000000014dc91	popq	%rbp
000000000014dc92	retq
000000000014dc93	nopw	%cs:(%rax,%rax)
