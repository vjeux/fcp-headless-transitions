__ZN13HGComicStroke10RenderTileEP6HGTile:
00000000001707d0	pushq	%rbp
00000000001707d1	movq	%rsp, %rbp
00000000001707d4	pushq	%r15
00000000001707d6	pushq	%r14
00000000001707d8	pushq	%r13
00000000001707da	pushq	%r12
00000000001707dc	pushq	%rbx
00000000001707dd	subq	$0xc8, %rsp
00000000001707e4	movq	%rsi, %rbx
00000000001707e7	movq	%rdi, %r15
00000000001707ea	movss	0x1a4(%rdi), %xmm0
00000000001707f2	movss	%xmm0, -0x2c(%rbp)
00000000001707f7	movq	%rsi, %rdi
00000000001707fa	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000001707ff	movq	(%r15), %rcx
0000000000170802	movq	%r15, %rdi
0000000000170805	movq	%rax, %rsi
0000000000170808	callq	*0x138(%rcx)
000000000017080e	movl	%eax, %edi
0000000000170810	movq	%rbx, -0x38(%rbp)
0000000000170814	movdqa	(%rbx), %xmm0
0000000000170818	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
000000000017081d	psubd	%xmm0, %xmm1
0000000000170821	pextrd	$0x1, %xmm1, %eax
0000000000170827	movl	%eax, -0x3c(%rbp)
000000000017082a	testl	%eax, %eax
000000000017082c	jle	0x170f74
0000000000170832	movd	%xmm1, %eax
0000000000170836	testl	%eax, %eax
0000000000170838	jle	0x170f74
000000000017083e	cvtdq2ps	%xmm0, %xmm7
0000000000170841	mulps	0x259868(%rip), %xmm7
0000000000170848	addps	0x259871(%rip), %xmm7
000000000017084f	movss	0x198(%r15), %xmm0
0000000000170858	movss	0x259a90(%rip), %xmm1
0000000000170860	mulss	%xmm0, %xmm1
0000000000170864	mulss	%xmm0, %xmm1
0000000000170868	movss	0x257450(%rip), %xmm2
0000000000170870	movaps	%xmm2, %xmm4
0000000000170873	divss	%xmm1, %xmm4
0000000000170877	addss	%xmm0, %xmm0
000000000017087b	cvttss2si	%xmm0, %r13d
0000000000170880	movaps	%xmm2, %xmm8
0000000000170884	divss	-0x2c(%rbp), %xmm8
000000000017088a	shufps	$0x0, %xmm8, %xmm8              ## xmm8 = xmm8[0,0,0,0]
000000000017088f	movq	-0x38(%rbp), %rcx
0000000000170893	movq	0x10(%rcx), %rcx
0000000000170897	movq	%rcx, -0x50(%rbp)
000000000017089b	movl	%eax, %eax
000000000017089d	movq	%rax, -0x90(%rbp)
00000000001708a4	movl	%r13d, -0x40(%rbp)
00000000001708a8	negl	%r13d
00000000001708ab	xorl	%eax, %eax
00000000001708ad	xorps	%xmm9, %xmm9
00000000001708b1	xorps	%xmm5, %xmm5
00000000001708b4	movss	0x25740c(%rip), %xmm6
00000000001708bc	movaps	0x25735c(%rip), %xmm10
00000000001708c4	movaps	0x257374(%rip), %xmm11
00000000001708cc	movaps	%xmm7, %xmm0
00000000001708cf	movq	%r15, -0x98(%rbp)
00000000001708d6	movl	%edi, -0x44(%rbp)
00000000001708d9	movaps	%xmm7, -0xc0(%rbp)
00000000001708e0	movss	%xmm4, -0x30(%rbp)
00000000001708e5	movaps	%xmm8, -0xb0(%rbp)
00000000001708ed	jmp	0x170920
00000000001708ef	nop
00000000001708f0	movaps	-0xe0(%rbp), %xmm0
00000000001708f7	addps	0x2573b2(%rip), %xmm0
00000000001708fe	movq	-0x38(%rbp), %rax
0000000000170902	movslq	0x18(%rax), %rax
0000000000170906	shlq	$0x4, %rax
000000000017090a	addq	%rax, -0x50(%rbp)
000000000017090e	movq	-0x88(%rbp), %rax
0000000000170915	incl	%eax
0000000000170917	cmpl	-0x3c(%rbp), %eax
000000000017091a	je	0x170f74
0000000000170920	movq	%rax, -0x88(%rbp)
0000000000170927	xorl	%edx, %edx
0000000000170929	movaps	%xmm0, -0xe0(%rbp)
0000000000170930	movaps	%xmm0, %xmm12
0000000000170934	jmp	0x170970
0000000000170936	nopw	%cs:(%rax,%rax)
0000000000170940	blendps	$0x8, %xmm3, %xmm0              ## xmm0 = xmm0[0,1,2],xmm3[3]
0000000000170946	movq	%rdx, %rax
0000000000170949	shlq	$0x4, %rax
000000000017094d	movq	-0x50(%rbp), %rcx
0000000000170951	movaps	%xmm0, (%rcx,%rax)
0000000000170955	movss	0x257363(%rip), %xmm0
000000000017095d	addps	%xmm0, %xmm12
0000000000170961	incq	%rdx
0000000000170964	cmpq	-0x90(%rbp), %rdx
000000000017096b	movl	-0x44(%rbp), %edi
000000000017096e	je	0x1708f0
0000000000170970	movaps	%xmm8, %xmm13
0000000000170974	mulps	%xmm12, %xmm13
0000000000170978	movq	-0x38(%rbp), %rax
000000000017097c	movq	0x50(%rax), %r14
0000000000170980	movslq	0x58(%rax), %r12
0000000000170984	subps	%xmm7, %xmm13
0000000000170988	testl	%edi, %edi
000000000017098a	je	0x170cf0
0000000000170990	cvttps2dq	%xmm13, %xmm0
0000000000170995	movaps	%xmm13, %xmm1
0000000000170999	cmpltps	%xmm9, %xmm1
000000000017099e	paddd	%xmm0, %xmm1
00000000001709a2	cvtdq2ps	%xmm1, %xmm0
00000000001709a5	subps	%xmm0, %xmm13
00000000001709a9	pextrd	$0x1, %xmm1, %eax
00000000001709af	movd	%xmm1, %ecx
00000000001709b3	imull	%r12d, %eax
00000000001709b7	addl	%ecx, %eax
00000000001709b9	cltq
00000000001709bb	shlq	$0x4, %rax
00000000001709bf	leaq	(%r14,%rax), %rcx
00000000001709c3	movaps	%xmm13, %xmm0
00000000001709c7	shufps	$0x0, %xmm13, %xmm0             ## xmm0 = xmm0[0,0],xmm13[0,0]
00000000001709cc	movaps	(%r14,%rax), %xmm1
00000000001709d1	movaps	0x10(%r14,%rax), %xmm2
00000000001709d7	subps	%xmm1, %xmm2
00000000001709da	mulps	%xmm0, %xmm2
00000000001709dd	addps	%xmm1, %xmm2
00000000001709e0	movq	%r12, %rax
00000000001709e3	shlq	$0x4, %rax
00000000001709e7	movaps	(%rax,%rcx), %xmm1
00000000001709eb	movaps	0x10(%rax,%rcx), %xmm3
00000000001709f0	subps	%xmm1, %xmm3
00000000001709f3	mulps	%xmm0, %xmm3
00000000001709f6	addps	%xmm1, %xmm3
00000000001709f9	subps	%xmm2, %xmm3
00000000001709fc	shufps	$0x55, %xmm13, %xmm13           ## xmm13 = xmm13[1,1,1,1]
0000000000170a01	mulps	%xmm3, %xmm13
0000000000170a05	addps	%xmm2, %xmm13
0000000000170a09	movshdup	%xmm13, %xmm0                   ## xmm0 = xmm13[1,1,3,3]
0000000000170a0e	ucomiss	%xmm0, %xmm0
0000000000170a11	jnp	0x170a1a
0000000000170a13	blendps	$0x2, %xmm9, %xmm13             ## xmm13 = xmm13[0],xmm9[1],xmm13[2,3]
0000000000170a1a	movaps	%xmm13, %xmm0
0000000000170a1e	unpckhpd	%xmm13, %xmm0                   ## xmm0 = xmm0[1],xmm13[1]
0000000000170a23	ucomiss	%xmm0, %xmm0
0000000000170a26	jnp	0x170a2f
0000000000170a28	blendps	$0x4, %xmm9, %xmm13             ## xmm13 = xmm13[0,1],xmm9[2],xmm13[3]
0000000000170a2f	movq	%rdx, -0xa0(%rbp)
0000000000170a36	movss	0x1a0(%r15), %xmm0
0000000000170a3f	ucomiss	%xmm5, %xmm0
0000000000170a42	movaps	%xmm13, %xmm5
0000000000170a46	jne	0x170a4e
0000000000170a48	jnp	0x170ad5
0000000000170a4e	movq	-0x38(%rbp), %rax
0000000000170a52	movq	0x60(%rax), %rcx
0000000000170a56	movslq	0x68(%rax), %rax
0000000000170a5a	movaps	%xmm12, %xmm5
0000000000170a5e	subps	%xmm7, %xmm5
0000000000170a61	testl	%edi, %edi
0000000000170a63	je	0x170d40
0000000000170a69	cvttps2dq	%xmm5, %xmm0
0000000000170a6d	movaps	%xmm5, %xmm1
0000000000170a70	cmpltps	%xmm9, %xmm1
0000000000170a75	paddd	%xmm0, %xmm1
0000000000170a79	cvtdq2ps	%xmm1, %xmm0
0000000000170a7c	subps	%xmm0, %xmm5
0000000000170a7f	movd	%xmm1, %edx
0000000000170a83	pextrd	$0x1, %xmm1, %esi
0000000000170a89	imull	%eax, %esi
0000000000170a8c	addl	%edx, %esi
0000000000170a8e	movslq	%esi, %rdx
0000000000170a91	shlq	$0x4, %rdx
0000000000170a95	leaq	(%rcx,%rdx), %rsi
0000000000170a99	movaps	%xmm5, %xmm0
0000000000170a9c	shufps	$0x0, %xmm5, %xmm0              ## xmm0 = xmm0[0,0],xmm5[0,0]
0000000000170aa0	movaps	(%rcx,%rdx), %xmm1
0000000000170aa4	movaps	0x10(%rcx,%rdx), %xmm2
0000000000170aa9	subps	%xmm1, %xmm2
0000000000170aac	mulps	%xmm0, %xmm2
0000000000170aaf	addps	%xmm1, %xmm2
0000000000170ab2	shlq	$0x4, %rax
0000000000170ab6	movaps	(%rax,%rsi), %xmm1
0000000000170aba	movaps	0x10(%rax,%rsi), %xmm3
0000000000170abf	subps	%xmm1, %xmm3
0000000000170ac2	mulps	%xmm0, %xmm3
0000000000170ac5	addps	%xmm1, %xmm3
0000000000170ac8	subps	%xmm2, %xmm3
0000000000170acb	shufps	$0x55, %xmm5, %xmm5             ## xmm5 = xmm5[1,1,1,1]
0000000000170acf	mulps	%xmm3, %xmm5
0000000000170ad2	addps	%xmm2, %xmm5
0000000000170ad5	cmpl	$0x1, -0x40(%rbp)
0000000000170ad9	movaps	%xmm5, -0xf0(%rbp)
0000000000170ae0	jle	0x170d81
0000000000170ae6	movaps	%xmm13, %xmm14
0000000000170aea	shufps	$0xe9, %xmm9, %xmm14            ## xmm14 = xmm14[1,2],xmm9[2,3]
0000000000170aef	addps	%xmm14, %xmm14
0000000000170af3	addps	%xmm10, %xmm14
0000000000170af7	minps	%xmm11, %xmm14
0000000000170afb	maxps	%xmm10, %xmm14
0000000000170aff	movaps	%xmm14, %xmm15
0000000000170b03	xorps	0x2595c5(%rip), %xmm15
0000000000170b0b	testl	%edi, %edi
0000000000170b0d	movaps	%xmm12, -0xd0(%rbp)
0000000000170b15	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
0000000000170b1a	je	0x170d8b
0000000000170b20	movq	%r12, %r15
0000000000170b23	shlq	$0x4, %r15
0000000000170b27	movss	%xmm6, -0x2c(%rbp)
0000000000170b2c	nopl	(%rax)
0000000000170b30	movaps	%xmm15, -0x60(%rbp)
0000000000170b35	movaps	%xmm14, -0x70(%rbp)
0000000000170b3a	movaps	%xmm13, -0x80(%rbp)
0000000000170b3f	xorps	%xmm0, %xmm0
0000000000170b42	cvtsi2ss	%ebx, %xmm0
0000000000170b46	mulss	%xmm4, %xmm0
0000000000170b4a	callq	0x3c50fc                        ## symbol stub for: _expf
0000000000170b4f	movaps	-0x60(%rbp), %xmm15
0000000000170b54	movaps	-0x70(%rbp), %xmm14
0000000000170b59	movaps	-0x80(%rbp), %xmm13
0000000000170b5e	movaps	-0xd0(%rbp), %xmm12
0000000000170b66	movaps	0x2570d2(%rip), %xmm11
0000000000170b6e	movaps	0x2570aa(%rip), %xmm10
0000000000170b76	xorps	%xmm9, %xmm9
0000000000170b7a	movaps	-0xb0(%rbp), %xmm8
0000000000170b82	movaps	-0xc0(%rbp), %xmm7
0000000000170b89	movaps	%xmm12, %xmm1
0000000000170b8d	addps	%xmm14, %xmm1
0000000000170b91	mulps	%xmm8, %xmm1
0000000000170b95	subps	%xmm7, %xmm1
0000000000170b98	cvttps2dq	%xmm1, %xmm2
0000000000170b9c	movaps	%xmm1, %xmm3
0000000000170b9f	cmpltps	%xmm9, %xmm3
0000000000170ba4	paddd	%xmm2, %xmm3
0000000000170ba8	cvtdq2ps	%xmm3, %xmm2
0000000000170bab	subps	%xmm2, %xmm1
0000000000170bae	movd	%xmm3, %eax
0000000000170bb2	pextrd	$0x1, %xmm3, %ecx
0000000000170bb8	imull	%r12d, %ecx
0000000000170bbc	addl	%eax, %ecx
0000000000170bbe	movslq	%ecx, %rax
0000000000170bc1	shlq	$0x4, %rax
0000000000170bc5	leaq	(%r14,%rax), %rcx
0000000000170bc9	movaps	%xmm1, %xmm2
0000000000170bcc	shufps	$0x0, %xmm1, %xmm2              ## xmm2 = xmm2[0,0],xmm1[0,0]
0000000000170bd0	movaps	(%r14,%rax), %xmm3
0000000000170bd5	movaps	0x10(%r14,%rax), %xmm4
0000000000170bdb	subps	%xmm3, %xmm4
0000000000170bde	mulps	%xmm2, %xmm4
0000000000170be1	addps	%xmm3, %xmm4
0000000000170be4	movaps	(%r15,%rcx), %xmm3
0000000000170be9	movaps	0x10(%r15,%rcx), %xmm5
0000000000170bef	subps	%xmm3, %xmm5
0000000000170bf2	mulps	%xmm2, %xmm5
0000000000170bf5	addps	%xmm3, %xmm5
0000000000170bf8	subps	%xmm4, %xmm5
0000000000170bfb	shufps	$0x55, %xmm1, %xmm1             ## xmm1 = xmm1[1,1,1,1]
0000000000170bff	mulps	%xmm5, %xmm1
0000000000170c02	addps	%xmm4, %xmm1
0000000000170c05	movaps	%xmm12, %xmm2
0000000000170c09	addps	%xmm15, %xmm2
0000000000170c0d	mulps	%xmm8, %xmm2
0000000000170c11	subps	%xmm7, %xmm2
0000000000170c14	cvttps2dq	%xmm2, %xmm3
0000000000170c18	movaps	%xmm2, %xmm4
0000000000170c1b	cmpltps	%xmm9, %xmm4
0000000000170c20	paddd	%xmm3, %xmm4
0000000000170c24	cvtdq2ps	%xmm4, %xmm3
0000000000170c27	subps	%xmm3, %xmm2
0000000000170c2a	movd	%xmm4, %eax
0000000000170c2e	pextrd	$0x1, %xmm4, %ecx
0000000000170c34	imull	%r12d, %ecx
0000000000170c38	addl	%eax, %ecx
0000000000170c3a	movslq	%ecx, %rax
0000000000170c3d	shlq	$0x4, %rax
0000000000170c41	leaq	(%r14,%rax), %rcx
0000000000170c45	movaps	%xmm2, %xmm3
0000000000170c48	shufps	$0x0, %xmm2, %xmm3              ## xmm3 = xmm3[0,0],xmm2[0,0]
0000000000170c4c	movaps	(%r14,%rax), %xmm4
0000000000170c51	movaps	0x10(%r14,%rax), %xmm5
0000000000170c57	subps	%xmm4, %xmm5
0000000000170c5a	mulps	%xmm3, %xmm5
0000000000170c5d	addps	%xmm4, %xmm5
0000000000170c60	movaps	(%r15,%rcx), %xmm4
0000000000170c65	movaps	0x10(%r15,%rcx), %xmm6
0000000000170c6b	subps	%xmm4, %xmm6
0000000000170c6e	mulps	%xmm3, %xmm6
0000000000170c71	addps	%xmm4, %xmm6
0000000000170c74	movss	-0x30(%rbp), %xmm4
0000000000170c79	subps	%xmm5, %xmm6
0000000000170c7c	shufps	$0x55, %xmm2, %xmm2             ## xmm2 = xmm2[1,1,1,1]
0000000000170c80	mulps	%xmm6, %xmm2
0000000000170c83	movss	-0x2c(%rbp), %xmm3
0000000000170c88	addss	%xmm0, %xmm3
0000000000170c8c	movss	%xmm3, -0x2c(%rbp)
0000000000170c91	addps	%xmm5, %xmm2
0000000000170c94	movaps	%xmm1, %xmm3
0000000000170c97	addss	%xmm2, %xmm3
0000000000170c9b	mulss	%xmm0, %xmm3
0000000000170c9f	addss	%xmm3, %xmm13
0000000000170ca4	shufps	$0xe9, %xmm9, %xmm1             ## xmm1 = xmm1[1,2],xmm9[2,3]
0000000000170ca9	addps	%xmm1, %xmm1
0000000000170cac	addps	%xmm10, %xmm1
0000000000170cb0	minps	%xmm11, %xmm1
0000000000170cb4	maxps	%xmm10, %xmm1
0000000000170cb8	addps	%xmm1, %xmm14
0000000000170cbc	shufps	$0xe9, %xmm9, %xmm2             ## xmm2 = xmm2[1,2],xmm9[2,3]
0000000000170cc1	addps	%xmm2, %xmm2
0000000000170cc4	addps	%xmm10, %xmm2
0000000000170cc8	minps	%xmm11, %xmm2
0000000000170ccc	maxps	%xmm10, %xmm2
0000000000170cd0	addps	%xmm2, %xmm15
0000000000170cd4	decl	%ebx
0000000000170cd6	cmpl	%ebx, %r13d
0000000000170cd9	jne	0x170b30
0000000000170cdf	jmp	0x170ed0
0000000000170ce4	nopw	%cs:(%rax,%rax)
0000000000170cf0	addps	0x256f78(%rip), %xmm13
0000000000170cf8	cvtps2dq	%xmm13, %xmm0
0000000000170cfd	cvtdq2ps	%xmm0, %xmm1
0000000000170d00	cmpltps	%xmm1, %xmm13
0000000000170d05	paddd	%xmm0, %xmm13
0000000000170d0a	movd	%xmm13, %eax
0000000000170d0f	pextrd	$0x1, %xmm13, %ecx
0000000000170d16	imull	%r12d, %ecx
0000000000170d1a	addl	%eax, %ecx
0000000000170d1c	movslq	%ecx, %rax
0000000000170d1f	shlq	$0x4, %rax
0000000000170d23	movaps	(%r14,%rax), %xmm13
0000000000170d28	movshdup	%xmm13, %xmm0                   ## xmm0 = xmm13[1,1,3,3]
0000000000170d2d	ucomiss	%xmm0, %xmm0
0000000000170d30	jp	0x170a13
0000000000170d36	jmp	0x170a1a
0000000000170d3b	nopl	(%rax,%rax)
0000000000170d40	addps	0x256f29(%rip), %xmm5
0000000000170d47	cvtps2dq	%xmm5, %xmm0
0000000000170d4b	cvtdq2ps	%xmm0, %xmm1
0000000000170d4e	cmpltps	%xmm1, %xmm5
0000000000170d52	paddd	%xmm0, %xmm5
0000000000170d56	movd	%xmm5, %edx
0000000000170d5a	pextrd	$0x1, %xmm5, %esi
0000000000170d60	imull	%eax, %esi
0000000000170d63	addl	%edx, %esi
0000000000170d65	movslq	%esi, %rax
0000000000170d68	shlq	$0x4, %rax
0000000000170d6c	movaps	(%rcx,%rax), %xmm5
0000000000170d70	cmpl	$0x1, -0x40(%rbp)
0000000000170d74	movaps	%xmm5, -0xf0(%rbp)
0000000000170d7b	jg	0x170ae6
0000000000170d81	movss	%xmm6, -0x2c(%rbp)
0000000000170d86	jmp	0x170ed0
0000000000170d8b	movss	%xmm6, -0x2c(%rbp)
0000000000170d90	movaps	%xmm15, -0x60(%rbp)
0000000000170d95	movaps	%xmm14, -0x70(%rbp)
0000000000170d9a	movaps	%xmm13, -0x80(%rbp)
0000000000170d9f	xorps	%xmm0, %xmm0
0000000000170da2	cvtsi2ss	%ebx, %xmm0
0000000000170da6	mulss	%xmm4, %xmm0
0000000000170daa	callq	0x3c50fc                        ## symbol stub for: _expf
0000000000170daf	movaps	-0x60(%rbp), %xmm15
0000000000170db4	movaps	-0x70(%rbp), %xmm14
0000000000170db9	movaps	-0x80(%rbp), %xmm13
0000000000170dbe	movaps	-0xd0(%rbp), %xmm12
0000000000170dc6	movaps	0x256e72(%rip), %xmm11
0000000000170dce	movaps	0x256e4a(%rip), %xmm10
0000000000170dd6	xorps	%xmm9, %xmm9
0000000000170dda	movaps	-0xb0(%rbp), %xmm8
0000000000170de2	movaps	-0xc0(%rbp), %xmm7
0000000000170de9	movss	-0x2c(%rbp), %xmm1
0000000000170dee	addss	%xmm0, %xmm1
0000000000170df2	movss	%xmm1, -0x2c(%rbp)
0000000000170df7	movaps	%xmm12, %xmm1
0000000000170dfb	addps	%xmm14, %xmm1
0000000000170dff	mulps	%xmm8, %xmm1
0000000000170e03	subps	%xmm7, %xmm1
0000000000170e06	movaps	0x256e63(%rip), %xmm4
0000000000170e0d	addps	%xmm4, %xmm1
0000000000170e10	cvtps2dq	%xmm1, %xmm2
0000000000170e14	cvtdq2ps	%xmm2, %xmm3
0000000000170e17	cmpltps	%xmm3, %xmm1
0000000000170e1b	paddd	%xmm2, %xmm1
0000000000170e1f	movd	%xmm1, %eax
0000000000170e23	pextrd	$0x1, %xmm1, %ecx
0000000000170e29	imull	%r12d, %ecx
0000000000170e2d	addl	%eax, %ecx
0000000000170e2f	movslq	%ecx, %rax
0000000000170e32	shlq	$0x4, %rax
0000000000170e36	movaps	(%r14,%rax), %xmm1
0000000000170e3b	movaps	%xmm12, %xmm2
0000000000170e3f	addps	%xmm15, %xmm2
0000000000170e43	mulps	%xmm8, %xmm2
0000000000170e47	subps	%xmm7, %xmm2
0000000000170e4a	addps	%xmm4, %xmm2
0000000000170e4d	cvtps2dq	%xmm2, %xmm3
0000000000170e51	cvtdq2ps	%xmm3, %xmm4
0000000000170e54	cmpltps	%xmm4, %xmm2
0000000000170e58	movss	-0x30(%rbp), %xmm4
0000000000170e5d	paddd	%xmm3, %xmm2
0000000000170e61	pextrd	$0x1, %xmm2, %eax
0000000000170e67	movd	%xmm2, %ecx
0000000000170e6b	imull	%r12d, %eax
0000000000170e6f	addl	%ecx, %eax
0000000000170e71	cltq
0000000000170e73	shlq	$0x4, %rax
0000000000170e77	movaps	(%r14,%rax), %xmm2
0000000000170e7c	movaps	%xmm1, %xmm3
0000000000170e7f	addss	%xmm2, %xmm3
0000000000170e83	mulss	%xmm0, %xmm3
0000000000170e87	addss	%xmm3, %xmm13
0000000000170e8c	shufps	$0xe9, %xmm9, %xmm1             ## xmm1 = xmm1[1,2],xmm9[2,3]
0000000000170e91	addps	%xmm1, %xmm1
0000000000170e94	addps	%xmm10, %xmm1
0000000000170e98	minps	%xmm11, %xmm1
0000000000170e9c	maxps	%xmm10, %xmm1
0000000000170ea0	addps	%xmm1, %xmm14
0000000000170ea4	shufps	$0xe9, %xmm9, %xmm2             ## xmm2 = xmm2[1,2],xmm9[2,3]
0000000000170ea9	addps	%xmm2, %xmm2
0000000000170eac	addps	%xmm10, %xmm2
0000000000170eb0	minps	%xmm11, %xmm2
0000000000170eb4	maxps	%xmm10, %xmm2
0000000000170eb8	addps	%xmm2, %xmm15
0000000000170ebc	decl	%ebx
0000000000170ebe	cmpl	%ebx, %r13d
0000000000170ec1	jne	0x170d90
0000000000170ec7	nopw	(%rax,%rax)
0000000000170ed0	movss	0x256df0(%rip), %xmm6
0000000000170ed8	mulss	%xmm6, %xmm13
0000000000170edd	divss	-0x2c(%rbp), %xmm13
0000000000170ee3	divss	0x259234(%rip), %xmm13
0000000000170eec	xorps	%xmm5, %xmm5
0000000000170eef	maxss	%xmm5, %xmm13
0000000000170ef4	movss	0x256dc4(%rip), %xmm2
0000000000170efc	minss	%xmm2, %xmm13
0000000000170f01	movaps	%xmm13, %xmm0
0000000000170f05	mulss	%xmm13, %xmm0
0000000000170f0a	addss	%xmm13, %xmm13
0000000000170f0f	movss	0x2593d9(%rip), %xmm1
0000000000170f17	subss	%xmm13, %xmm1
0000000000170f1c	mulss	%xmm0, %xmm1
0000000000170f20	movaps	-0xf0(%rbp), %xmm3
0000000000170f27	blendps	$0x3, %xmm1, %xmm3              ## xmm3 = xmm1[0,1],xmm3[2,3]
0000000000170f2d	shufps	$0xc0, %xmm3, %xmm3             ## xmm3 = xmm3[0,0,0,3]
0000000000170f31	minps	%xmm11, %xmm3
0000000000170f35	maxps	%xmm9, %xmm3
0000000000170f39	movq	-0x98(%rbp), %r15
0000000000170f40	movss	0x19c(%r15), %xmm0
0000000000170f49	ucomiss	%xmm2, %xmm0
0000000000170f4c	movaps	%xmm3, %xmm0
0000000000170f4f	movq	-0xa0(%rbp), %rdx
0000000000170f56	jne	0x170940
0000000000170f5c	movaps	%xmm3, %xmm0
0000000000170f5f	jp	0x170940
0000000000170f65	movaps	%xmm3, %xmm0
0000000000170f68	shufps	$0xff, %xmm3, %xmm0             ## xmm0 = xmm0[3,3],xmm3[3,3]
0000000000170f6c	mulps	%xmm3, %xmm0
0000000000170f6f	jmp	0x170940
0000000000170f74	xorl	%eax, %eax
0000000000170f76	addq	$0xc8, %rsp
0000000000170f7d	popq	%rbx
0000000000170f7e	popq	%r12
0000000000170f80	popq	%r13
0000000000170f82	popq	%r14
0000000000170f84	popq	%r15
0000000000170f86	popq	%rbp
0000000000170f87	retq
0000000000170f88	nopl	(%rax,%rax)
