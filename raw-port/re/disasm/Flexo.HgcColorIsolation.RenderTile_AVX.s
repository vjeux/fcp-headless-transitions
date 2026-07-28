__ZN17HgcColorIsolation14RenderTile_AVXEP6HGTile:
000000000145b4d0	pushq	%rbp
000000000145b4d1	movq	%rsp, %rbp
000000000145b4d4	pushq	%r15
000000000145b4d6	pushq	%r14
000000000145b4d8	pushq	%r13
000000000145b4da	pushq	%r12
000000000145b4dc	pushq	%rbx
000000000145b4dd	andq	$-0x20, %rsp
000000000145b4e1	subq	$0x380, %rsp                    ## imm = 0x380
000000000145b4e8	movq	%rsi, %rbx
000000000145b4eb	movq	%rdi, %r14
000000000145b4ee	movq	%rsi, %rdi
000000000145b4f1	callq	0x1497218                       ## symbol stub for: __ZNK6HGTile8RendererEv
000000000145b4f6	movq	(%r14), %rcx
000000000145b4f9	movq	%r14, %rdi
000000000145b4fc	movq	%rax, %rsi
000000000145b4ff	callq	*0x138(%rcx)
000000000145b505	movl	0xc(%rbx), %r12d
000000000145b509	subl	0x4(%rbx), %r12d
000000000145b50d	jle	0x145cb10
000000000145b513	movl	0x8(%rbx), %edx
000000000145b516	subl	(%rbx), %edx
000000000145b518	movl	0xe8(%rbx), %esi
000000000145b51e	subl	0xe0(%rbx), %esi
000000000145b524	vcvtsi2ss	%esi, %xmm15, %xmm1
000000000145b528	vxorps	%xmm0, %xmm0, %xmm0
000000000145b52c	vblendps	$0x1, %xmm1, %xmm0, %xmm0       ## xmm0 = xmm1[0],xmm0[1,2,3]
000000000145b532	vinsertf128	$0x1, %xmm0, %ymm0, %ymm2
000000000145b538	movslq	0x18(%rbx), %rcx
000000000145b53c	movq	0x10(%rbx), %rdi
000000000145b540	movq	0x50(%rbx), %r8
000000000145b544	movslq	0x58(%rbx), %r13
000000000145b548	vmovaps	0x12dfb0(%rip), %ymm0
000000000145b550	vmovaps	%ymm2, 0x340(%rsp)
000000000145b559	vaddps	%ymm0, %ymm2, %ymm2
000000000145b55d	vmovaps	%ymm2, 0x300(%rsp)
000000000145b566	vaddps	%ymm0, %ymm2, %ymm0
000000000145b56a	vmovaps	%ymm0, 0x320(%rsp)
000000000145b573	vmovss	0x1119e5(%rip), %xmm0
000000000145b57b	vmovaps	%xmm1, 0x2f0(%rsp)
000000000145b584	vaddss	%xmm0, %xmm1, %xmm1
000000000145b588	vmovaps	%xmm1, 0x230(%rsp)
000000000145b591	vaddss	%xmm0, %xmm1, %xmm0
000000000145b595	vmovaps	%xmm0, 0x2e0(%rsp)
000000000145b59e	shlq	$0x4, %rcx
000000000145b5a2	shlq	$0x4, %r13
000000000145b5a6	xorl	%r10d, %r10d
000000000145b5a9	movl	%r12d, 0x1c(%rsp)
000000000145b5ae	movq	%r13, 0x138(%rsp)
000000000145b5b6	jmp	0x145b642
000000000145b5bb	nopl	(%rax,%rax)
000000000145b5c0	vaddss	0x1119a4(%rip), %xmm2, %xmm2
000000000145b5c8	vblendps	$0x1, %xmm2, %xmm1, %xmm1       ## xmm1 = xmm2[0],xmm1[1,2,3]
000000000145b5ce	vxorps	%xmm2, %xmm2, %xmm2
000000000145b5d2	vmaxss	%xmm2, %xmm1, %xmm1
000000000145b5d6	vminss	0x230(%rsp), %xmm1, %xmm1
000000000145b5df	vminss	0x2e0(%rsp), %xmm1, %xmm2
000000000145b5e8	vcvttss2si	%xmm2, %esi
000000000145b5ec	movq	0x60(%rbx), %r9
000000000145b5f0	movslq	%esi, %rsi
000000000145b5f3	vcvtsi2ss	%esi, %xmm10, %xmm2
000000000145b5f7	shlq	$0x4, %rsi
000000000145b5fb	vsubss	%xmm2, %xmm1, %xmm1
000000000145b5ff	vmovaps	(%r9,%rsi), %xmm2
000000000145b605	vmovaps	0x10(%r9,%rsi), %xmm3
000000000145b60c	vsubps	%xmm2, %xmm3, %xmm3
000000000145b610	vshufps	$0x0, %xmm1, %xmm1, %xmm1       ## xmm1 = xmm1[0,0,0,0]
000000000145b615	vmulps	%xmm1, %xmm3, %xmm1
000000000145b619	vaddps	%xmm1, %xmm2, %xmm1
000000000145b61d	vandps	0x3c0(%r15), %xmm1, %xmm1
000000000145b626	vorps	%xmm0, %xmm1, %xmm0
000000000145b62a	vmovaps	%xmm0, (%rdi,%r11)
000000000145b630	addq	%r13, %r8
000000000145b633	addq	%rcx, %rdi
000000000145b636	incl	%r10d
000000000145b639	cmpl	%r12d, %r10d
000000000145b63c	je	0x145cb10
000000000145b642	movl	$0x0, %r11d
000000000145b648	cmpl	$0x2, %edx
000000000145b64b	jl	0x145c220
000000000145b651	movl	$0x10, %r15d
000000000145b657	xorl	%r11d, %r11d
000000000145b65a	jmp	0x145b70e
000000000145b65f	nop
000000000145b660	vaddps	0x12deb8(%rip), %ymm1, %ymm1
000000000145b668	vxorps	%xmm2, %xmm2, %xmm2
000000000145b66c	vmaxps	%ymm2, %ymm1, %ymm1
000000000145b670	vminps	0x300(%rsp), %ymm1, %ymm1
000000000145b679	vmovaps	0x320(%rsp), %ymm2
000000000145b682	vminps	%ymm1, %ymm2, %ymm2
000000000145b686	vcvttps2dq	%ymm2, %ymm3
000000000145b68a	vroundps	$0x3, %ymm2, %ymm2
000000000145b690	vsubps	%ymm2, %ymm1, %ymm1
000000000145b694	vmovd	%xmm3, %esi
000000000145b698	movslq	%esi, %rsi
000000000145b69b	shlq	$0x4, %rsi
000000000145b69f	vextractf128	$0x1, %ymm3, %xmm2
000000000145b6a5	vmovd	%xmm2, %r9d
000000000145b6aa	movslq	%r9d, %r9
000000000145b6ad	shlq	$0x4, %r9
000000000145b6b1	vmovaps	(%r13,%rsi), %xmm2
000000000145b6b8	vmovaps	0x10(%r13,%rsi), %xmm3
000000000145b6bf	vinsertf128	$0x1, (%r13,%r9), %ymm2, %ymm2
000000000145b6c7	vinsertf128	$0x1, 0x10(%r13,%r9), %ymm3, %ymm3
000000000145b6cf	vsubps	%ymm2, %ymm3, %ymm3
000000000145b6d3	vshufps	$0x0, %ymm1, %ymm1, %ymm1       ## ymm1 = ymm1[0,0,0,0,4,4,4,4]
000000000145b6d8	vmulps	%ymm3, %ymm1, %ymm1
000000000145b6dc	vaddps	%ymm1, %ymm2, %ymm1
000000000145b6e0	vandps	0x3c0(%r12), %ymm1, %ymm1
000000000145b6ea	vorps	%ymm0, %ymm1, %ymm0
000000000145b6ee	vmovups	%ymm0, -0x10(%rdi,%r15)
000000000145b6f5	addq	$0x20, %r15
000000000145b6f9	movl	%r11d, %esi
000000000145b6fc	addl	$-0x2, %r11d
000000000145b700	addl	%edx, %esi
000000000145b702	addl	$-0x2, %esi
000000000145b705	cmpl	$0x1, %esi
000000000145b708	jle	0x145c210
000000000145b70e	vmovups	-0x10(%r8,%r15), %ymm0
000000000145b715	movq	0x198(%r14), %r12
000000000145b71c	vmovups	0x120(%r12), %ymm1
000000000145b726	vmovups	0x140(%r12), %ymm10
000000000145b730	vmaxps	%ymm1, %ymm0, %ymm0
000000000145b734	vminps	%ymm10, %ymm0, %ymm0
000000000145b739	vandps	0x160(%r12), %ymm0, %ymm0
000000000145b743	vorps	%ymm1, %ymm0, %ymm9
000000000145b747	vdpps	$0xff, (%r12), %ymm9, %ymm0
000000000145b74e	vmovups	0x180(%r12), %ymm11
000000000145b758	vandps	%ymm0, %ymm11, %ymm0
000000000145b75c	vmovups	0x1a0(%r12), %ymm12
000000000145b766	vandps	%ymm0, %ymm12, %ymm1
000000000145b76a	vmovaps	%ymm12, 0xa0(%rsp)
000000000145b773	vorps	%ymm1, %ymm10, %ymm1
000000000145b777	vmovups	0x1c0(%r12), %ymm8
000000000145b781	vcmpltps	%ymm8, %ymm0, %ymm2
000000000145b787	vmovaps	%ymm8, 0x160(%rsp)
000000000145b790	vmovups	0x1e0(%r12), %ymm3
000000000145b79a	vmovaps	%ymm3, 0xc0(%rsp)
000000000145b7a3	vandps	%ymm3, %ymm2, %ymm2
000000000145b7a7	vpsrld	$0x17, %xmm0, %xmm3
000000000145b7ac	vextractf128	$0x1, %ymm0, %xmm0
000000000145b7b2	vpsrld	$0x17, %xmm0, %xmm0
000000000145b7b7	vinsertf128	$0x1, %xmm0, %ymm3, %ymm0
000000000145b7bd	vcvtdq2ps	%ymm0, %ymm0
000000000145b7c1	vsubps	%ymm2, %ymm0, %ymm0
000000000145b7c5	vmovups	0x200(%r12), %ymm2
000000000145b7cf	vmovaps	%ymm2, 0xe0(%rsp)
000000000145b7d8	vsubps	%ymm2, %ymm0, %ymm0
000000000145b7dc	vmovups	0x220(%r12), %ymm7
000000000145b7e6	vcmpltps	%ymm1, %ymm7, %ymm2
000000000145b7eb	vmovaps	%ymm7, 0x1a0(%rsp)
000000000145b7f4	vandps	%ymm2, %ymm10, %ymm2
000000000145b7f8	vaddps	%ymm0, %ymm2, %ymm0
000000000145b7fc	vmovups	0x240(%r12), %ymm6
000000000145b806	vmulps	%ymm2, %ymm6, %ymm2
000000000145b80a	vmovaps	%ymm6, 0x40(%rsp)
000000000145b810	vmulps	%ymm1, %ymm2, %ymm2
000000000145b814	vsubps	%ymm10, %ymm1, %ymm1
000000000145b819	vsubps	%ymm2, %ymm1, %ymm2
000000000145b81d	vmulps	%ymm2, %ymm2, %ymm1
000000000145b821	vmovups	0x260(%r12), %ymm5
000000000145b82b	vmulps	%ymm2, %ymm5, %ymm3
000000000145b82f	vmovaps	%ymm5, 0x20(%rsp)
000000000145b835	vmovups	0x280(%r12), %ymm15
000000000145b83f	vaddps	%ymm3, %ymm15, %ymm3
000000000145b843	vmovaps	%ymm15, 0x180(%rsp)
000000000145b84c	vmulps	%ymm3, %ymm1, %ymm3
000000000145b850	vmovups	0x2a0(%r12), %ymm1
000000000145b85a	vmovaps	%ymm1, 0x200(%rsp)
000000000145b863	vmulps	%ymm2, %ymm1, %ymm4
000000000145b867	vmovups	0x2c0(%r12), %ymm1
000000000145b871	vmovaps	%ymm1, 0x1e0(%rsp)
000000000145b87a	vaddps	%ymm4, %ymm1, %ymm4
000000000145b87e	vaddps	%ymm3, %ymm4, %ymm3
000000000145b882	vmulps	%ymm3, %ymm2, %ymm2
000000000145b886	vmovups	0xc0(%r12), %ymm1
000000000145b890	vmovaps	%ymm1, 0x1c0(%rsp)
000000000145b899	vaddps	%ymm2, %ymm0, %ymm0
000000000145b89d	vmulps	%ymm0, %ymm1, %ymm0
000000000145b8a1	vmovups	0x2e0(%r12), %ymm1
000000000145b8ab	vmovaps	%ymm1, 0x60(%rsp)
000000000145b8b1	vmaxps	%ymm1, %ymm0, %ymm0
000000000145b8b5	vroundps	$0x9, %ymm0, %ymm4
000000000145b8bb	vsubps	%ymm4, %ymm0, %ymm0
000000000145b8bf	vmovups	0x300(%r12), %ymm1
000000000145b8c9	vmovaps	%ymm1, 0x240(%rsp)
000000000145b8d2	vmulps	%ymm1, %ymm0, %ymm3
000000000145b8d6	vmovups	0x320(%r12), %ymm13
000000000145b8e0	vaddps	%ymm3, %ymm13, %ymm3
000000000145b8e4	vmulps	%ymm3, %ymm0, %ymm1
000000000145b8e8	vmovups	0x340(%r12), %ymm2
000000000145b8f2	vmovaps	%ymm2, 0x100(%rsp)
000000000145b8fb	vaddps	%ymm1, %ymm2, %ymm1
000000000145b8ff	vmulps	%ymm1, %ymm0, %ymm2
000000000145b903	vcvttps2dq	%ymm4, %ymm1
000000000145b907	vmovdqa	0x360(%r12), %xmm4
000000000145b911	vpaddd	%xmm1, %xmm4, %xmm0
000000000145b915	vextractf128	$0x1, %ymm1, %xmm1
000000000145b91b	vpaddd	%xmm1, %xmm4, %xmm1
000000000145b91f	vpslld	$0x17, %xmm0, %xmm0
000000000145b924	vpslld	$0x17, %xmm1, %xmm1
000000000145b929	vinsertf128	$0x1, %xmm1, %ymm0, %ymm0
000000000145b92f	vaddps	%ymm2, %ymm10, %ymm1
000000000145b933	vmovaps	%ymm9, 0x140(%rsp)
000000000145b93c	vdpps	$0xff, 0x20(%r12), %ymm9, %ymm2
000000000145b944	vmulps	%ymm0, %ymm1, %ymm0
000000000145b948	vmovaps	%ymm0, 0x80(%rsp)
000000000145b951	vmovaps	%ymm11, 0x280(%rsp)
000000000145b95a	vandps	%ymm2, %ymm11, %ymm1
000000000145b95e	vextractf128	$0x1, %ymm1, %xmm2
000000000145b964	vpsrld	$0x17, %xmm2, %xmm2
000000000145b969	vpsrld	$0x17, %xmm1, %xmm14
000000000145b96e	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145b974	vcmpltps	%ymm8, %ymm1, %ymm14
000000000145b97a	vmovaps	0xc0(%rsp), %ymm0
000000000145b983	vandps	%ymm0, %ymm14, %ymm14
000000000145b987	vcvtdq2ps	%ymm2, %ymm2
000000000145b98b	vsubps	%ymm14, %ymm2, %ymm2
000000000145b990	vandps	%ymm1, %ymm12, %ymm1
000000000145b994	vorps	%ymm1, %ymm10, %ymm1
000000000145b998	vmovaps	0xe0(%rsp), %ymm3
000000000145b9a1	vsubps	%ymm3, %ymm2, %ymm2
000000000145b9a5	vcmpltps	%ymm1, %ymm7, %ymm14
000000000145b9aa	vandps	%ymm10, %ymm14, %ymm14
000000000145b9af	vaddps	%ymm2, %ymm14, %ymm2
000000000145b9b3	vmulps	%ymm6, %ymm14, %ymm14
000000000145b9b7	vmulps	%ymm1, %ymm14, %ymm14
000000000145b9bb	vsubps	%ymm10, %ymm1, %ymm1
000000000145b9c0	vsubps	%ymm14, %ymm1, %ymm1
000000000145b9c5	vmulps	%ymm1, %ymm5, %ymm14
000000000145b9c9	vaddps	%ymm14, %ymm15, %ymm14
000000000145b9ce	vmulps	%ymm1, %ymm1, %ymm15
000000000145b9d2	vmulps	%ymm14, %ymm15, %ymm14
000000000145b9d7	vmovaps	0x200(%rsp), %ymm5
000000000145b9e0	vmulps	%ymm1, %ymm5, %ymm15
000000000145b9e4	vmovaps	0x1e0(%rsp), %ymm6
000000000145b9ed	vaddps	%ymm6, %ymm15, %ymm15
000000000145b9f1	vaddps	%ymm14, %ymm15, %ymm14
000000000145b9f6	vmulps	%ymm1, %ymm14, %ymm1
000000000145b9fa	vaddps	%ymm1, %ymm2, %ymm1
000000000145b9fe	vmovaps	0x1c0(%rsp), %ymm12
000000000145ba07	vmulps	%ymm1, %ymm12, %ymm1
000000000145ba0b	vmovaps	0x60(%rsp), %ymm7
000000000145ba11	vmaxps	%ymm7, %ymm1, %ymm1
000000000145ba15	vroundps	$0x9, %ymm1, %ymm2
000000000145ba1b	vsubps	%ymm2, %ymm1, %ymm1
000000000145ba1f	vmovaps	0x240(%rsp), %ymm8
000000000145ba28	vmulps	%ymm1, %ymm8, %ymm14
000000000145ba2c	vmovaps	%ymm13, 0x260(%rsp)
000000000145ba35	vaddps	%ymm14, %ymm13, %ymm14
000000000145ba3a	vmulps	%ymm1, %ymm14, %ymm14
000000000145ba3e	vaddps	0x100(%rsp), %ymm14, %ymm14
000000000145ba47	vmulps	%ymm1, %ymm14, %ymm1
000000000145ba4b	vcvttps2dq	%ymm2, %ymm2
000000000145ba4f	vpaddd	%xmm2, %xmm4, %xmm14
000000000145ba53	vextractf128	$0x1, %ymm2, %xmm2
000000000145ba59	vpaddd	%xmm2, %xmm4, %xmm2
000000000145ba5d	vpslld	$0x17, %xmm14, %xmm14
000000000145ba63	vpslld	$0x17, %xmm2, %xmm2
000000000145ba68	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145ba6e	vaddps	%ymm1, %ymm10, %ymm1
000000000145ba72	vdpps	$0xff, 0x40(%r12), %ymm9, %ymm14
000000000145ba7a	vmulps	%ymm2, %ymm1, %ymm1
000000000145ba7e	vaddps	0x80(%rsp), %ymm1, %ymm1
000000000145ba87	vmovaps	%ymm1, 0x80(%rsp)
000000000145ba90	vandps	%ymm14, %ymm11, %ymm1
000000000145ba95	vextractf128	$0x1, %ymm1, %xmm2
000000000145ba9b	vpsrld	$0x17, %xmm2, %xmm2
000000000145baa0	vpsrld	$0x17, %xmm1, %xmm14
000000000145baa5	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145baab	vmovaps	0x160(%rsp), %ymm11
000000000145bab4	vcmpltps	%ymm11, %ymm1, %ymm14
000000000145baba	vandps	%ymm0, %ymm14, %ymm14
000000000145babe	vcvtdq2ps	%ymm2, %ymm2
000000000145bac2	vsubps	%ymm14, %ymm2, %ymm2
000000000145bac7	vmovaps	0xa0(%rsp), %ymm9
000000000145bad0	vandps	%ymm1, %ymm9, %ymm1
000000000145bad4	vorps	%ymm1, %ymm10, %ymm1
000000000145bad8	vsubps	%ymm3, %ymm2, %ymm2
000000000145badc	vmovaps	0x1a0(%rsp), %ymm0
000000000145bae5	vcmpltps	%ymm1, %ymm0, %ymm14
000000000145baea	vandps	%ymm10, %ymm14, %ymm14
000000000145baef	vaddps	%ymm2, %ymm14, %ymm2
000000000145baf3	vmulps	0x40(%rsp), %ymm14, %ymm14
000000000145baf9	vmulps	%ymm1, %ymm14, %ymm14
000000000145bafd	vsubps	%ymm10, %ymm1, %ymm1
000000000145bb02	vsubps	%ymm14, %ymm1, %ymm1
000000000145bb07	vmulps	0x20(%rsp), %ymm1, %ymm14
000000000145bb0d	vaddps	0x180(%rsp), %ymm14, %ymm14
000000000145bb16	vmulps	%ymm1, %ymm1, %ymm15
000000000145bb1a	vmulps	%ymm14, %ymm15, %ymm14
000000000145bb1f	vmulps	%ymm1, %ymm5, %ymm15
000000000145bb23	vaddps	%ymm6, %ymm15, %ymm15
000000000145bb27	vaddps	%ymm14, %ymm15, %ymm14
000000000145bb2c	vmulps	%ymm1, %ymm14, %ymm1
000000000145bb30	vaddps	%ymm1, %ymm2, %ymm1
000000000145bb34	vmulps	%ymm1, %ymm12, %ymm1
000000000145bb38	vmaxps	%ymm7, %ymm1, %ymm1
000000000145bb3c	vroundps	$0x9, %ymm1, %ymm2
000000000145bb42	vsubps	%ymm2, %ymm1, %ymm1
000000000145bb46	vmulps	%ymm1, %ymm8, %ymm14
000000000145bb4a	vmovaps	%ymm8, %ymm7
000000000145bb4e	vaddps	%ymm14, %ymm13, %ymm14
000000000145bb53	vmulps	%ymm1, %ymm14, %ymm14
000000000145bb57	vmovaps	0x100(%rsp), %ymm3
000000000145bb60	vaddps	%ymm3, %ymm14, %ymm14
000000000145bb64	vmulps	%ymm1, %ymm14, %ymm1
000000000145bb68	vcvttps2dq	%ymm2, %ymm2
000000000145bb6c	vmovdqa	%xmm4, (%rsp)
000000000145bb71	vpaddd	%xmm2, %xmm4, %xmm14
000000000145bb75	vextractf128	$0x1, %ymm2, %xmm2
000000000145bb7b	vpaddd	%xmm2, %xmm4, %xmm2
000000000145bb7f	vpslld	$0x17, %xmm14, %xmm14
000000000145bb85	vpslld	$0x17, %xmm2, %xmm2
000000000145bb8a	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145bb90	vaddps	%ymm1, %ymm10, %ymm1
000000000145bb94	vmulps	%ymm2, %ymm1, %ymm1
000000000145bb98	vaddps	0x80(%rsp), %ymm1, %ymm0
000000000145bba1	vextractf128	$0x1, %ymm0, %xmm1
000000000145bba7	vpsrld	$0x17, %xmm1, %xmm1
000000000145bbac	vpsrld	$0x17, %xmm0, %xmm2
000000000145bbb1	vinsertf128	$0x1, %xmm1, %ymm2, %ymm1
000000000145bbb7	vshufps	$0x0, %ymm0, %ymm0, %ymm0       ## ymm0 = ymm0[0,0,0,0,4,4,4,4]
000000000145bbbc	vmovaps	%ymm11, %ymm5
000000000145bbc0	vcmpltps	%ymm11, %ymm0, %ymm2
000000000145bbc6	vmovaps	0xc0(%rsp), %ymm6
000000000145bbcf	vandps	%ymm6, %ymm2, %ymm2
000000000145bbd3	vshufps	$0x0, %ymm1, %ymm1, %ymm1       ## ymm1 = ymm1[0,0,0,0,4,4,4,4]
000000000145bbd8	vcvtdq2ps	%ymm1, %ymm1
000000000145bbdc	vsubps	%ymm2, %ymm1, %ymm1
000000000145bbe0	vmovaps	%ymm9, %ymm13
000000000145bbe5	vandps	%ymm0, %ymm9, %ymm0
000000000145bbe9	vorps	%ymm0, %ymm10, %ymm0
000000000145bbed	vmovaps	0xe0(%rsp), %ymm8
000000000145bbf6	vsubps	%ymm8, %ymm1, %ymm1
000000000145bbfb	vmovaps	0x1a0(%rsp), %ymm9
000000000145bc04	vcmpltps	%ymm0, %ymm9, %ymm2
000000000145bc09	vandps	%ymm2, %ymm10, %ymm2
000000000145bc0d	vaddps	%ymm2, %ymm1, %ymm1
000000000145bc11	vmovaps	0x40(%rsp), %ymm11
000000000145bc17	vmulps	%ymm2, %ymm11, %ymm2
000000000145bc1b	vmulps	%ymm0, %ymm2, %ymm2
000000000145bc1f	vsubps	%ymm10, %ymm0, %ymm0
000000000145bc24	vsubps	%ymm2, %ymm0, %ymm0
000000000145bc28	vmovaps	0x20(%rsp), %ymm15
000000000145bc2e	vmulps	%ymm0, %ymm15, %ymm2
000000000145bc32	vmovaps	0x180(%rsp), %ymm4
000000000145bc3b	vaddps	%ymm2, %ymm4, %ymm2
000000000145bc3f	vmulps	%ymm0, %ymm0, %ymm14
000000000145bc43	vmulps	%ymm2, %ymm14, %ymm2
000000000145bc47	vmovaps	0x200(%rsp), %ymm12
000000000145bc50	vmulps	%ymm0, %ymm12, %ymm14
000000000145bc54	vaddps	0x1e0(%rsp), %ymm14, %ymm14
000000000145bc5d	vaddps	%ymm2, %ymm14, %ymm2
000000000145bc61	vmulps	%ymm2, %ymm0, %ymm0
000000000145bc65	vaddps	%ymm0, %ymm1, %ymm0
000000000145bc69	vbroadcastss	0xc4(%r12), %ymm1
000000000145bc73	vmovaps	%ymm1, 0x2c0(%rsp)
000000000145bc7c	vmulps	%ymm0, %ymm1, %ymm0
000000000145bc80	vmaxps	0x60(%rsp), %ymm0, %ymm0
000000000145bc86	vroundps	$0x9, %ymm0, %ymm1
000000000145bc8c	vsubps	%ymm1, %ymm0, %ymm0
000000000145bc90	vmulps	%ymm0, %ymm7, %ymm2
000000000145bc94	vaddps	0x260(%rsp), %ymm2, %ymm2
000000000145bc9d	vmulps	%ymm2, %ymm0, %ymm2
000000000145bca1	vaddps	%ymm2, %ymm3, %ymm2
000000000145bca5	vmulps	%ymm2, %ymm0, %ymm0
000000000145bca9	vcvttps2dq	%ymm1, %ymm1
000000000145bcad	vmovdqa	(%rsp), %xmm3
000000000145bcb2	vpaddd	%xmm1, %xmm3, %xmm2
000000000145bcb6	vextractf128	$0x1, %ymm1, %xmm1
000000000145bcbc	vpaddd	%xmm1, %xmm3, %xmm1
000000000145bcc0	vpslld	$0x17, %xmm2, %xmm2
000000000145bcc5	vpslld	$0x17, %xmm1, %xmm1
000000000145bcca	vinsertf128	$0x1, %xmm1, %ymm2, %ymm1
000000000145bcd0	vaddps	%ymm0, %ymm10, %ymm0
000000000145bcd4	vmulps	%ymm1, %ymm0, %ymm0
000000000145bcd8	vmovaps	%ymm0, 0x80(%rsp)
000000000145bce1	vmovaps	0x140(%rsp), %ymm3
000000000145bcea	vdpps	$0xff, 0x60(%r12), %ymm3, %ymm0
000000000145bcf2	vandps	0x280(%rsp), %ymm0, %ymm0
000000000145bcfb	vextractf128	$0x1, %ymm0, %xmm1
000000000145bd01	vpsrld	$0x17, %xmm1, %xmm1
000000000145bd06	vpsrld	$0x17, %xmm0, %xmm2
000000000145bd0b	vinsertf128	$0x1, %xmm1, %ymm2, %ymm1
000000000145bd11	vcmpltps	%ymm5, %ymm0, %ymm2
000000000145bd16	vandps	%ymm6, %ymm2, %ymm2
000000000145bd1a	vcvtdq2ps	%ymm1, %ymm1
000000000145bd1e	vsubps	%ymm2, %ymm1, %ymm1
000000000145bd22	vandps	%ymm0, %ymm13, %ymm0
000000000145bd26	vorps	%ymm0, %ymm10, %ymm0
000000000145bd2a	vsubps	%ymm8, %ymm1, %ymm1
000000000145bd2f	vcmpltps	%ymm0, %ymm9, %ymm2
000000000145bd34	vmovaps	%ymm9, %ymm13
000000000145bd39	vandps	%ymm2, %ymm10, %ymm2
000000000145bd3d	vaddps	%ymm1, %ymm2, %ymm1
000000000145bd41	vmulps	%ymm2, %ymm11, %ymm2
000000000145bd45	vmulps	%ymm0, %ymm2, %ymm2
000000000145bd49	vsubps	%ymm10, %ymm0, %ymm0
000000000145bd4e	vsubps	%ymm2, %ymm0, %ymm0
000000000145bd52	vmulps	%ymm0, %ymm15, %ymm2
000000000145bd56	vmovaps	%ymm4, %ymm5
000000000145bd5a	vaddps	%ymm2, %ymm4, %ymm2
000000000145bd5e	vmulps	%ymm0, %ymm0, %ymm14
000000000145bd62	vmulps	%ymm2, %ymm14, %ymm2
000000000145bd66	vmulps	%ymm0, %ymm12, %ymm14
000000000145bd6a	vmovaps	0x1e0(%rsp), %ymm6
000000000145bd73	vaddps	%ymm6, %ymm14, %ymm14
000000000145bd77	vaddps	%ymm2, %ymm14, %ymm2
000000000145bd7b	vmulps	%ymm2, %ymm0, %ymm0
000000000145bd7f	vaddps	%ymm0, %ymm1, %ymm0
000000000145bd83	vmovaps	0x1c0(%rsp), %ymm4
000000000145bd8c	vmulps	%ymm0, %ymm4, %ymm0
000000000145bd90	vmovaps	0x60(%rsp), %ymm8
000000000145bd96	vmaxps	%ymm8, %ymm0, %ymm0
000000000145bd9b	vroundps	$0x9, %ymm0, %ymm1
000000000145bda1	vsubps	%ymm1, %ymm0, %ymm0
000000000145bda5	vmulps	%ymm0, %ymm7, %ymm2
000000000145bda9	vmovaps	0x260(%rsp), %ymm7
000000000145bdb2	vaddps	%ymm2, %ymm7, %ymm2
000000000145bdb6	vmulps	%ymm2, %ymm0, %ymm2
000000000145bdba	vmovaps	0x100(%rsp), %ymm9
000000000145bdc3	vaddps	%ymm2, %ymm9, %ymm2
000000000145bdc7	vmulps	%ymm2, %ymm0, %ymm0
000000000145bdcb	vcvttps2dq	%ymm1, %ymm1
000000000145bdcf	vmovdqa	(%rsp), %xmm11
000000000145bdd4	vpaddd	%xmm1, %xmm11, %xmm2
000000000145bdd8	vextractf128	$0x1, %ymm1, %xmm1
000000000145bdde	vpaddd	%xmm1, %xmm11, %xmm1
000000000145bde2	vpslld	$0x17, %xmm2, %xmm2
000000000145bde7	vpslld	$0x17, %xmm1, %xmm1
000000000145bdec	vinsertf128	$0x1, %xmm1, %ymm2, %ymm1
000000000145bdf2	vaddps	%ymm0, %ymm10, %ymm0
000000000145bdf6	vmulps	%ymm1, %ymm0, %ymm0
000000000145bdfa	vmovaps	%ymm0, 0x2a0(%rsp)
000000000145be03	vdpps	$0xff, 0x80(%r12), %ymm3, %ymm1
000000000145be0e	vmovaps	0x280(%rsp), %ymm11
000000000145be17	vandps	%ymm1, %ymm11, %ymm1
000000000145be1b	vextractf128	$0x1, %ymm1, %xmm2
000000000145be21	vpsrld	$0x17, %xmm2, %xmm2
000000000145be26	vpsrld	$0x17, %xmm1, %xmm14
000000000145be2b	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145be31	vcmpltps	0x160(%rsp), %ymm1, %ymm14
000000000145be3b	vandps	0xc0(%rsp), %ymm14, %ymm14
000000000145be44	vcvtdq2ps	%ymm2, %ymm2
000000000145be48	vsubps	%ymm14, %ymm2, %ymm2
000000000145be4d	vandps	0xa0(%rsp), %ymm1, %ymm1
000000000145be56	vorps	%ymm1, %ymm10, %ymm1
000000000145be5a	vsubps	0xe0(%rsp), %ymm2, %ymm2
000000000145be63	vcmpltps	%ymm1, %ymm13, %ymm14
000000000145be68	vandps	%ymm10, %ymm14, %ymm14
000000000145be6d	vaddps	%ymm2, %ymm14, %ymm2
000000000145be71	vmovaps	0x40(%rsp), %ymm13
000000000145be77	vmulps	%ymm14, %ymm13, %ymm14
000000000145be7c	vmulps	%ymm1, %ymm14, %ymm14
000000000145be80	vsubps	%ymm10, %ymm1, %ymm1
000000000145be85	vsubps	%ymm14, %ymm1, %ymm1
000000000145be8a	vmulps	%ymm1, %ymm15, %ymm14
000000000145be8e	vaddps	%ymm5, %ymm14, %ymm14
000000000145be92	vmulps	%ymm1, %ymm1, %ymm15
000000000145be96	vmulps	%ymm14, %ymm15, %ymm14
000000000145be9b	vmovaps	%ymm12, %ymm0
000000000145be9f	vmulps	%ymm1, %ymm12, %ymm15
000000000145bea3	vaddps	%ymm6, %ymm15, %ymm15
000000000145bea7	vaddps	%ymm14, %ymm15, %ymm14
000000000145beac	vmulps	%ymm1, %ymm14, %ymm1
000000000145beb0	vaddps	%ymm1, %ymm2, %ymm1
000000000145beb4	vmulps	%ymm1, %ymm4, %ymm1
000000000145beb8	vmaxps	%ymm8, %ymm1, %ymm1
000000000145bebd	vroundps	$0x9, %ymm1, %ymm2
000000000145bec3	vsubps	%ymm2, %ymm1, %ymm1
000000000145bec7	vmovaps	0x240(%rsp), %ymm12
000000000145bed0	vmulps	%ymm1, %ymm12, %ymm14
000000000145bed4	vaddps	%ymm7, %ymm14, %ymm14
000000000145bed8	vmovaps	%ymm7, %ymm8
000000000145bedc	vmulps	%ymm1, %ymm14, %ymm14
000000000145bee0	vaddps	%ymm14, %ymm9, %ymm14
000000000145bee5	vmovaps	%ymm9, %ymm7
000000000145bee9	vmulps	%ymm1, %ymm14, %ymm1
000000000145beed	vcvttps2dq	%ymm2, %ymm2
000000000145bef1	vmovdqa	(%rsp), %xmm3
000000000145bef6	vpaddd	%xmm2, %xmm3, %xmm14
000000000145befa	vextractf128	$0x1, %ymm2, %xmm2
000000000145bf00	vpaddd	%xmm2, %xmm3, %xmm2
000000000145bf04	vpslld	$0x17, %xmm14, %xmm14
000000000145bf0a	vpslld	$0x17, %xmm2, %xmm2
000000000145bf0f	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145bf15	vaddps	%ymm1, %ymm10, %ymm1
000000000145bf19	vmulps	%ymm2, %ymm1, %ymm1
000000000145bf1d	vmovaps	0x140(%rsp), %ymm2
000000000145bf26	vdpps	$0xff, 0xa0(%r12), %ymm2, %ymm2
000000000145bf31	vaddps	0x2a0(%rsp), %ymm1, %ymm1
000000000145bf3a	vmovaps	%ymm1, 0x140(%rsp)
000000000145bf43	vandps	%ymm2, %ymm11, %ymm1
000000000145bf47	vextractf128	$0x1, %ymm1, %xmm2
000000000145bf4d	vpsrld	$0x17, %xmm2, %xmm2
000000000145bf52	vpsrld	$0x17, %xmm1, %xmm14
000000000145bf57	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145bf5d	vmovaps	0x160(%rsp), %ymm5
000000000145bf66	vcmpltps	%ymm5, %ymm1, %ymm14
000000000145bf6b	vmovaps	0xc0(%rsp), %ymm4
000000000145bf74	vandps	%ymm4, %ymm14, %ymm14
000000000145bf78	vcvtdq2ps	%ymm2, %ymm2
000000000145bf7c	vsubps	%ymm14, %ymm2, %ymm2
000000000145bf81	vmovaps	0xa0(%rsp), %ymm3
000000000145bf8a	vandps	%ymm3, %ymm1, %ymm1
000000000145bf8e	vorps	%ymm1, %ymm10, %ymm1
000000000145bf92	vmovaps	0xe0(%rsp), %ymm11
000000000145bf9b	vsubps	%ymm11, %ymm2, %ymm2
000000000145bfa0	vmovaps	0x1a0(%rsp), %ymm9
000000000145bfa9	vcmpltps	%ymm1, %ymm9, %ymm14
000000000145bfae	vandps	%ymm10, %ymm14, %ymm14
000000000145bfb3	vaddps	%ymm2, %ymm14, %ymm2
000000000145bfb7	vmulps	%ymm14, %ymm13, %ymm14
000000000145bfbc	vmulps	%ymm1, %ymm14, %ymm14
000000000145bfc0	vsubps	%ymm10, %ymm1, %ymm1
000000000145bfc5	vsubps	%ymm14, %ymm1, %ymm1
000000000145bfca	vmulps	0x20(%rsp), %ymm1, %ymm14
000000000145bfd0	vmovaps	0x180(%rsp), %ymm13
000000000145bfd9	vaddps	%ymm14, %ymm13, %ymm14
000000000145bfde	vmulps	%ymm1, %ymm1, %ymm15
000000000145bfe2	vmulps	%ymm14, %ymm15, %ymm14
000000000145bfe7	vmulps	%ymm1, %ymm0, %ymm15
000000000145bfeb	vaddps	%ymm6, %ymm15, %ymm15
000000000145bfef	vaddps	%ymm14, %ymm15, %ymm14
000000000145bff4	vmulps	%ymm1, %ymm14, %ymm1
000000000145bff8	vaddps	%ymm1, %ymm2, %ymm1
000000000145bffc	vmulps	0x1c0(%rsp), %ymm1, %ymm1
000000000145c005	vmovaps	0x60(%rsp), %ymm15
000000000145c00b	vmaxps	%ymm15, %ymm1, %ymm1
000000000145c010	vroundps	$0x9, %ymm1, %ymm2
000000000145c016	vsubps	%ymm2, %ymm1, %ymm1
000000000145c01a	vmulps	%ymm1, %ymm12, %ymm14
000000000145c01e	vaddps	%ymm14, %ymm8, %ymm14
000000000145c023	vmulps	%ymm1, %ymm14, %ymm14
000000000145c027	vaddps	%ymm7, %ymm14, %ymm14
000000000145c02b	vmulps	%ymm1, %ymm14, %ymm1
000000000145c02f	vcvttps2dq	%ymm2, %ymm2
000000000145c033	vmovdqa	(%rsp), %xmm7
000000000145c038	vpaddd	%xmm2, %xmm7, %xmm14
000000000145c03c	vextractf128	$0x1, %ymm2, %xmm2
000000000145c042	vpaddd	%xmm2, %xmm7, %xmm2
000000000145c046	vpslld	$0x17, %xmm14, %xmm14
000000000145c04c	vpslld	$0x17, %xmm2, %xmm2
000000000145c051	vinsertf128	$0x1, %xmm2, %ymm14, %ymm2
000000000145c057	vaddps	%ymm1, %ymm10, %ymm1
000000000145c05b	vmulps	%ymm2, %ymm1, %ymm1
000000000145c05f	vaddps	0x140(%rsp), %ymm1, %ymm0
000000000145c068	vshufps	$0x0, %ymm0, %ymm0, %ymm1       ## ymm1 = ymm0[0,0,0,0,4,4,4,4]
000000000145c06d	vandps	%ymm1, %ymm3, %ymm2
000000000145c071	vcmpltps	%ymm5, %ymm1, %ymm1
000000000145c076	vandps	%ymm4, %ymm1, %ymm1
000000000145c07a	vpsrld	$0x17, %xmm0, %xmm14
000000000145c07f	vextractf128	$0x1, %ymm0, %xmm0
000000000145c085	vpsrld	$0x17, %xmm0, %xmm0
000000000145c08a	vinsertf128	$0x1, %xmm0, %ymm14, %ymm0
000000000145c090	vshufps	$0x0, %ymm0, %ymm0, %ymm0       ## ymm0 = ymm0[0,0,0,0,4,4,4,4]
000000000145c095	vcvtdq2ps	%ymm0, %ymm0
000000000145c099	vsubps	%ymm1, %ymm0, %ymm0
000000000145c09d	vsubps	%ymm11, %ymm0, %ymm0
000000000145c0a2	vorps	%ymm2, %ymm10, %ymm1
000000000145c0a6	vcmpltps	%ymm1, %ymm9, %ymm2
000000000145c0ab	vandps	%ymm2, %ymm10, %ymm2
000000000145c0af	vaddps	%ymm2, %ymm0, %ymm0
000000000145c0b3	vmulps	0x40(%rsp), %ymm2, %ymm2
000000000145c0b9	vmulps	%ymm1, %ymm2, %ymm2
000000000145c0bd	vsubps	%ymm10, %ymm1, %ymm1
000000000145c0c2	vsubps	%ymm2, %ymm1, %ymm1
000000000145c0c6	vmulps	0x20(%rsp), %ymm1, %ymm2
000000000145c0cc	vaddps	%ymm2, %ymm13, %ymm2
000000000145c0d0	vmulps	%ymm1, %ymm1, %ymm11
000000000145c0d4	vmulps	%ymm2, %ymm11, %ymm2
000000000145c0d8	vmulps	0x200(%rsp), %ymm1, %ymm9
000000000145c0e1	vaddps	%ymm6, %ymm9, %ymm6
000000000145c0e5	vaddps	%ymm2, %ymm6, %ymm2
000000000145c0e9	vmulps	%ymm2, %ymm1, %ymm1
000000000145c0ed	vaddps	%ymm1, %ymm0, %ymm0
000000000145c0f1	vmulps	0x2c0(%rsp), %ymm0, %ymm0
000000000145c0fa	vmaxps	%ymm15, %ymm0, %ymm0
000000000145c0ff	vroundps	$0x9, %ymm0, %ymm1
000000000145c105	vsubps	%ymm1, %ymm0, %ymm0
000000000145c109	vmulps	%ymm0, %ymm12, %ymm2
000000000145c10d	vaddps	%ymm2, %ymm8, %ymm2
000000000145c111	vmulps	%ymm2, %ymm0, %ymm2
000000000145c115	vaddps	0x100(%rsp), %ymm2, %ymm2
000000000145c11e	vmulps	%ymm2, %ymm0, %ymm0
000000000145c122	vcvttps2dq	%ymm1, %ymm1
000000000145c126	vpaddd	%xmm1, %xmm7, %xmm2
000000000145c12a	vextractf128	$0x1, %ymm1, %xmm1
000000000145c130	vpaddd	%xmm1, %xmm7, %xmm1
000000000145c134	vpslld	$0x17, %xmm2, %xmm2
000000000145c139	vpslld	$0x17, %xmm1, %xmm1
000000000145c13e	vinsertf128	$0x1, %xmm1, %ymm2, %ymm1
000000000145c144	vaddps	%ymm0, %ymm10, %ymm0
000000000145c148	vmulps	%ymm1, %ymm0, %ymm0
000000000145c14c	vmovaps	0x80(%rsp), %ymm2
000000000145c155	vsubps	%ymm0, %ymm2, %ymm1
000000000145c159	vshufps	$0x0, %ymm1, %ymm1, %ymm1       ## ymm1 = ymm1[0,0,0,0,4,4,4,4]
000000000145c15e	vrcpps	%ymm1, %ymm1
000000000145c162	vsubps	%ymm10, %ymm2, %ymm2
000000000145c167	vmulps	0x380(%r12), %ymm1, %ymm1
000000000145c171	vmulps	%ymm0, %ymm2, %ymm0
000000000145c175	vmulps	%ymm0, %ymm1, %ymm1
000000000145c179	vmovups	0x3a0(%r12), %ymm0
000000000145c183	vmaxps	%ymm0, %ymm1, %ymm1
000000000145c187	vminps	%ymm10, %ymm1, %ymm1
000000000145c18c	vsubps	%ymm1, %ymm10, %ymm1
000000000145c190	vmulps	0x100(%r12), %ymm1, %ymm1
000000000145c19a	vaddps	0xe0(%r12), %ymm1, %ymm1
000000000145c1a4	vmaxps	%ymm0, %ymm1, %ymm1
000000000145c1a8	vminps	%ymm10, %ymm1, %ymm1
000000000145c1ad	vshufps	$0xff, %ymm1, %ymm1, %ymm1      ## ymm1 = ymm1[3,3,3,3,7,7,7,7]
000000000145c1b2	movq	0x60(%rbx), %r13
000000000145c1b6	vmulps	0x340(%rsp), %ymm1, %ymm1
000000000145c1bf	testl	%eax, %eax
000000000145c1c1	jne	0x145b660
000000000145c1c7	vxorps	%xmm2, %xmm2, %xmm2
000000000145c1cb	vmaxps	%ymm2, %ymm1, %ymm1
000000000145c1cf	vminps	0x300(%rsp), %ymm1, %ymm1
000000000145c1d8	vcvttps2dq	%ymm1, %ymm1
000000000145c1dc	vmovd	%xmm1, %esi
000000000145c1e0	movslq	%esi, %rsi
000000000145c1e3	shlq	$0x4, %rsi
000000000145c1e7	vextractf128	$0x1, %ymm1, %xmm1
000000000145c1ed	vmovd	%xmm1, %r9d
000000000145c1f2	movslq	%r9d, %r9
000000000145c1f5	shlq	$0x4, %r9
000000000145c1f9	vmovaps	(%r13,%rsi), %xmm1
000000000145c200	vinsertf128	$0x1, (%r13,%r9), %ymm1, %ymm1
000000000145c208	jmp	0x145b6e0
000000000145c20d	nopl	(%rax)
000000000145c210	negl	%r11d
000000000145c213	movl	0x1c(%rsp), %r12d
000000000145c218	movq	0x138(%rsp), %r13
000000000145c220	cmpl	%edx, %r11d
000000000145c223	jge	0x145b630
000000000145c229	movl	%r11d, %r11d
000000000145c22c	shlq	$0x4, %r11
000000000145c230	vmovaps	(%r8,%r11), %xmm0
000000000145c236	movq	0x198(%r14), %r15
000000000145c23d	vmovaps	0x120(%r15), %xmm1
000000000145c246	vmovaps	0x140(%r15), %xmm10
000000000145c24f	vmaxps	%xmm1, %xmm0, %xmm0
000000000145c253	vminps	%xmm10, %xmm0, %xmm0
000000000145c258	vandps	0x160(%r15), %xmm0, %xmm0
000000000145c261	vorps	%xmm1, %xmm0, %xmm0
000000000145c265	vmovaps	%xmm0, 0x60(%rsp)
000000000145c26b	vdpps	$0xff, (%r15), %xmm0, %xmm1
000000000145c271	vdpps	$0xff, 0x20(%r15), %xmm0, %xmm0
000000000145c278	vmovaps	0x180(%r15), %xmm15
000000000145c281	vandps	%xmm1, %xmm15, %xmm1
000000000145c285	vmovaps	0x1a0(%r15), %xmm11
000000000145c28e	vandps	%xmm1, %xmm11, %xmm2
000000000145c292	vorps	%xmm2, %xmm10, %xmm2
000000000145c296	vmovaps	0x1c0(%r15), %xmm5
000000000145c29f	vcmpltps	%xmm5, %xmm1, %xmm3
000000000145c2a4	vmovaps	0x1e0(%r15), %xmm6
000000000145c2ad	vandps	%xmm6, %xmm3, %xmm3
000000000145c2b1	vpsrld	$0x17, %xmm1, %xmm1
000000000145c2b6	vcvtdq2ps	%xmm1, %xmm1
000000000145c2ba	vsubps	%xmm3, %xmm1, %xmm1
000000000145c2be	vmovaps	0x200(%r15), %xmm7
000000000145c2c7	vsubps	%xmm7, %xmm1, %xmm1
000000000145c2cb	vmovaps	0x220(%r15), %xmm12
000000000145c2d4	vcmpltps	%xmm2, %xmm12, %xmm3
000000000145c2d9	vandps	%xmm3, %xmm10, %xmm3
000000000145c2dd	vaddps	%xmm3, %xmm1, %xmm1
000000000145c2e1	vmovaps	0x240(%r15), %xmm14
000000000145c2ea	vmulps	%xmm3, %xmm14, %xmm3
000000000145c2ee	vmulps	%xmm2, %xmm3, %xmm3
000000000145c2f2	vsubps	%xmm10, %xmm2, %xmm2
000000000145c2f7	vsubps	%xmm3, %xmm2, %xmm2
000000000145c2fb	vmulps	%xmm2, %xmm2, %xmm3
000000000145c2ff	vmovaps	0x260(%r15), %xmm4
000000000145c308	vmovaps	%xmm4, 0x1c0(%rsp)
000000000145c311	vmulps	%xmm2, %xmm4, %xmm8
000000000145c315	vmovaps	0x280(%r15), %xmm9
000000000145c31e	vaddps	%xmm8, %xmm9, %xmm8
000000000145c323	vmulps	%xmm3, %xmm8, %xmm3
000000000145c327	vmovaps	0x2a0(%r15), %xmm4
000000000145c330	vmulps	%xmm2, %xmm4, %xmm13
000000000145c334	vmovaps	0x2c0(%r15), %xmm8
000000000145c33d	vaddps	%xmm13, %xmm8, %xmm13
000000000145c342	vaddps	%xmm3, %xmm13, %xmm3
000000000145c346	vmulps	%xmm3, %xmm2, %xmm2
000000000145c34a	vaddps	%xmm2, %xmm1, %xmm1
000000000145c34e	vmovaps	%xmm1, 0xa0(%rsp)
000000000145c357	vmovaps	%xmm15, 0x100(%rsp)
000000000145c360	vandps	%xmm0, %xmm15, %xmm0
000000000145c364	vcmpltps	%xmm5, %xmm0, %xmm1
000000000145c369	vmovaps	%xmm6, 0x1e0(%rsp)
000000000145c372	vandps	%xmm6, %xmm1, %xmm1
000000000145c376	vpsrld	$0x17, %xmm0, %xmm2
000000000145c37b	vcvtdq2ps	%xmm2, %xmm2
000000000145c37f	vsubps	%xmm1, %xmm2, %xmm1
000000000145c383	vmovaps	%xmm11, 0xc0(%rsp)
000000000145c38c	vandps	%xmm0, %xmm11, %xmm0
000000000145c390	vorps	%xmm0, %xmm10, %xmm0
000000000145c394	vmovaps	%xmm7, 0xe0(%rsp)
000000000145c39d	vsubps	%xmm7, %xmm1, %xmm1
000000000145c3a1	vcmpltps	%xmm0, %xmm12, %xmm2
000000000145c3a6	vandps	%xmm2, %xmm10, %xmm2
000000000145c3aa	vaddps	%xmm2, %xmm1, %xmm1
000000000145c3ae	vmovaps	%xmm1, 0x20(%rsp)
000000000145c3b4	vmovaps	%xmm14, 0x2c0(%rsp)
000000000145c3bd	vmulps	%xmm2, %xmm14, %xmm2
000000000145c3c1	vmulps	%xmm0, %xmm2, %xmm2
000000000145c3c5	vsubps	%xmm10, %xmm0, %xmm0
000000000145c3ca	vsubps	%xmm2, %xmm0, %xmm0
000000000145c3ce	vmovaps	0x1c0(%rsp), %xmm1
000000000145c3d7	vmulps	%xmm0, %xmm1, %xmm2
000000000145c3db	vmovaps	%xmm9, 0x40(%rsp)
000000000145c3e1	vaddps	%xmm2, %xmm9, %xmm2
000000000145c3e5	vmulps	%xmm0, %xmm0, %xmm3
000000000145c3e9	vmulps	%xmm2, %xmm3, %xmm2
000000000145c3ed	vmulps	%xmm0, %xmm4, %xmm3
000000000145c3f1	vaddps	%xmm3, %xmm8, %xmm3
000000000145c3f5	vmovaps	%xmm8, (%rsp)
000000000145c3fa	vmovaps	0x60(%rsp), %xmm13
000000000145c400	vdpps	$0xff, 0x40(%r15), %xmm13, %xmm13
000000000145c407	vaddps	%xmm2, %xmm3, %xmm2
000000000145c40b	vmulps	%xmm2, %xmm0, %xmm0
000000000145c40f	vaddps	0x20(%rsp), %xmm0, %xmm0
000000000145c415	vmovaps	%xmm0, 0x20(%rsp)
000000000145c41b	vandps	%xmm13, %xmm15, %xmm0
000000000145c420	vcmpltps	%xmm5, %xmm0, %xmm2
000000000145c425	vmovaps	%xmm5, %xmm15
000000000145c429	vandps	%xmm6, %xmm2, %xmm2
000000000145c42d	vpsrld	$0x17, %xmm0, %xmm3
000000000145c432	vcvtdq2ps	%xmm3, %xmm3
000000000145c436	vsubps	%xmm2, %xmm3, %xmm2
000000000145c43a	vandps	%xmm0, %xmm11, %xmm0
000000000145c43e	vorps	%xmm0, %xmm10, %xmm0
000000000145c442	vsubps	%xmm7, %xmm2, %xmm2
000000000145c446	vcmpltps	%xmm0, %xmm12, %xmm3
000000000145c44b	vmovaps	%xmm12, %xmm11
000000000145c450	vmovaps	%xmm12, 0x180(%rsp)
000000000145c459	vandps	%xmm3, %xmm10, %xmm3
000000000145c45d	vaddps	%xmm3, %xmm2, %xmm2
000000000145c461	vmulps	%xmm3, %xmm14, %xmm3
000000000145c465	vmulps	%xmm0, %xmm3, %xmm3
000000000145c469	vsubps	%xmm10, %xmm0, %xmm0
000000000145c46e	vsubps	%xmm3, %xmm0, %xmm0
000000000145c472	vmulps	%xmm0, %xmm1, %xmm3
000000000145c476	vaddps	%xmm3, %xmm9, %xmm3
000000000145c47a	vmulps	%xmm0, %xmm0, %xmm13
000000000145c47e	vmulps	%xmm3, %xmm13, %xmm3
000000000145c482	vmulps	%xmm0, %xmm4, %xmm13
000000000145c486	vmovaps	%xmm4, %xmm9
000000000145c48a	vmovaps	%xmm4, 0x160(%rsp)
000000000145c493	vaddps	%xmm13, %xmm8, %xmm13
000000000145c498	vaddps	%xmm3, %xmm13, %xmm3
000000000145c49c	vmulps	%xmm3, %xmm0, %xmm0
000000000145c4a0	vaddps	%xmm0, %xmm2, %xmm3
000000000145c4a4	vmovaps	0xc0(%r15), %xmm6
000000000145c4ad	vmulps	0x20(%rsp), %xmm6, %xmm1
000000000145c4b3	vmovaps	%xmm6, 0x280(%rsp)
000000000145c4bc	vmovaps	0x2e0(%r15), %xmm7
000000000145c4c5	vmaxps	%xmm7, %xmm1, %xmm1
000000000145c4c9	vroundps	$0x9, %xmm1, %xmm2
000000000145c4cf	vsubss	%xmm2, %xmm1, %xmm1
000000000145c4d3	vmovaps	0x300(%r15), %xmm8
000000000145c4dc	vmovaps	0x320(%r15), %xmm5
000000000145c4e5	vmulss	%xmm1, %xmm8, %xmm4
000000000145c4e9	vaddss	%xmm4, %xmm5, %xmm4
000000000145c4ed	vmulss	%xmm4, %xmm1, %xmm0
000000000145c4f1	vmovaps	0x340(%r15), %xmm13
000000000145c4fa	vaddss	%xmm0, %xmm13, %xmm0
000000000145c4fe	vmulss	%xmm0, %xmm1, %xmm0
000000000145c502	vcvttps2dq	%xmm2, %xmm2
000000000145c506	vmovdqa	0x360(%r15), %xmm14
000000000145c50f	vpaddd	%xmm2, %xmm14, %xmm2
000000000145c513	vpslld	$0x17, %xmm2, %xmm2
000000000145c518	vaddss	%xmm0, %xmm10, %xmm0
000000000145c51c	vmulss	%xmm2, %xmm0, %xmm1
000000000145c520	vmulps	0xa0(%rsp), %xmm6, %xmm2
000000000145c529	vmovaps	%xmm7, 0x20(%rsp)
000000000145c52f	vmaxps	%xmm7, %xmm2, %xmm2
000000000145c533	vroundps	$0x9, %xmm2, %xmm0
000000000145c539	vsubss	%xmm0, %xmm2, %xmm2
000000000145c53d	vmulss	%xmm2, %xmm8, %xmm12
000000000145c541	vaddss	%xmm5, %xmm12, %xmm12
000000000145c545	vmulss	%xmm2, %xmm12, %xmm12
000000000145c549	vaddss	%xmm12, %xmm13, %xmm12
000000000145c54e	vmulss	%xmm2, %xmm12, %xmm2
000000000145c552	vcvttps2dq	%xmm0, %xmm0
000000000145c556	vpaddd	%xmm0, %xmm14, %xmm0
000000000145c55a	vpslld	$0x17, %xmm0, %xmm0
000000000145c55f	vaddss	%xmm2, %xmm10, %xmm2
000000000145c563	vmulss	%xmm0, %xmm2, %xmm0
000000000145c567	vaddss	%xmm1, %xmm0, %xmm0
000000000145c56b	vmulps	%xmm3, %xmm6, %xmm1
000000000145c56f	vmaxps	%xmm7, %xmm1, %xmm1
000000000145c573	vroundps	$0x9, %xmm1, %xmm2
000000000145c579	vsubss	%xmm2, %xmm1, %xmm1
000000000145c57d	vmulss	%xmm1, %xmm8, %xmm3
000000000145c581	vmovaps	%xmm8, %xmm4
000000000145c585	vmovaps	%xmm8, 0x140(%rsp)
000000000145c58e	vaddss	%xmm3, %xmm5, %xmm3
000000000145c592	vmovaps	%xmm5, 0x260(%rsp)
000000000145c59b	vmulss	%xmm3, %xmm1, %xmm3
000000000145c59f	vaddss	%xmm3, %xmm13, %xmm3
000000000145c5a3	vmovaps	%xmm13, 0x240(%rsp)
000000000145c5ac	vmulss	%xmm3, %xmm1, %xmm1
000000000145c5b0	vcvttps2dq	%xmm2, %xmm2
000000000145c5b4	vpaddd	%xmm2, %xmm14, %xmm2
000000000145c5b8	vmovdqa	%xmm14, %xmm6
000000000145c5bc	vmovdqa	%xmm14, 0x80(%rsp)
000000000145c5c5	vpslld	$0x17, %xmm2, %xmm2
000000000145c5ca	vaddss	%xmm1, %xmm10, %xmm1
000000000145c5ce	vmulss	%xmm2, %xmm1, %xmm1
000000000145c5d2	vaddss	%xmm1, %xmm0, %xmm0
000000000145c5d6	vshufps	$0x0, %xmm0, %xmm0, %xmm0       ## xmm0 = xmm0[0,0,0,0]
000000000145c5db	vmovaps	%xmm15, %xmm14
000000000145c5e0	vmovaps	%xmm15, 0x1a0(%rsp)
000000000145c5e9	vcmpltps	%xmm15, %xmm0, %xmm1
000000000145c5ef	vmovaps	0x1e0(%rsp), %xmm15
000000000145c5f8	vandps	%xmm1, %xmm15, %xmm1
000000000145c5fc	vpsrld	$0x17, %xmm0, %xmm2
000000000145c601	vcvtdq2ps	%xmm2, %xmm2
000000000145c605	vsubps	%xmm1, %xmm2, %xmm1
000000000145c609	vmovaps	0xc0(%rsp), %xmm7
000000000145c612	vandps	%xmm0, %xmm7, %xmm0
000000000145c616	vorps	%xmm0, %xmm10, %xmm0
000000000145c61a	vsubps	0xe0(%rsp), %xmm1, %xmm1
000000000145c623	vcmpltps	%xmm0, %xmm11, %xmm2
000000000145c628	vandps	%xmm2, %xmm10, %xmm2
000000000145c62c	vaddps	%xmm2, %xmm1, %xmm1
000000000145c630	vmovaps	0x2c0(%rsp), %xmm11
000000000145c639	vmulps	%xmm2, %xmm11, %xmm2
000000000145c63d	vmulps	%xmm0, %xmm2, %xmm2
000000000145c641	vsubps	%xmm10, %xmm0, %xmm0
000000000145c646	vsubps	%xmm2, %xmm0, %xmm0
000000000145c64a	vmovaps	0x1c0(%rsp), %xmm12
000000000145c653	vmulps	%xmm0, %xmm12, %xmm2
000000000145c657	vmovaps	0x40(%rsp), %xmm8
000000000145c65d	vaddps	%xmm2, %xmm8, %xmm2
000000000145c661	vmulps	%xmm0, %xmm0, %xmm3
000000000145c665	vmulps	%xmm2, %xmm3, %xmm2
000000000145c669	vmulps	%xmm0, %xmm9, %xmm3
000000000145c66d	vmovaps	(%rsp), %xmm9
000000000145c672	vaddps	%xmm3, %xmm9, %xmm3
000000000145c676	vaddps	%xmm2, %xmm3, %xmm2
000000000145c67a	vmulps	%xmm2, %xmm0, %xmm0
000000000145c67e	vaddps	%xmm0, %xmm1, %xmm0
000000000145c682	vbroadcastss	0xc4(%r15), %xmm1
000000000145c68b	vmovaps	%xmm1, 0x200(%rsp)
000000000145c694	vmulps	%xmm0, %xmm1, %xmm0
000000000145c698	vmaxps	0x20(%rsp), %xmm0, %xmm0
000000000145c69e	vroundps	$0x9, %xmm0, %xmm1
000000000145c6a4	vsubps	%xmm1, %xmm0, %xmm0
000000000145c6a8	vmulps	%xmm0, %xmm4, %xmm2
000000000145c6ac	vaddps	%xmm2, %xmm5, %xmm2
000000000145c6b0	vmulps	%xmm2, %xmm0, %xmm2
000000000145c6b4	vaddps	%xmm2, %xmm13, %xmm2
000000000145c6b8	vmulps	%xmm2, %xmm0, %xmm0
000000000145c6bc	vaddps	%xmm0, %xmm10, %xmm0
000000000145c6c0	vcvttps2dq	%xmm1, %xmm1
000000000145c6c4	vpaddd	%xmm6, %xmm1, %xmm1
000000000145c6c8	vpslld	$0x17, %xmm1, %xmm1
000000000145c6cd	vmulps	%xmm1, %xmm0, %xmm0
000000000145c6d1	vmovaps	%xmm0, 0xa0(%rsp)
000000000145c6da	vmovaps	0x60(%rsp), %xmm4
000000000145c6e0	vdpps	$0xff, 0x60(%r15), %xmm4, %xmm0
000000000145c6e7	vmovaps	0x100(%rsp), %xmm5
000000000145c6f0	vandps	%xmm0, %xmm5, %xmm0
000000000145c6f4	vcmpltps	%xmm14, %xmm0, %xmm1
000000000145c6fa	vandps	%xmm1, %xmm15, %xmm1
000000000145c6fe	vmovaps	%xmm15, %xmm13
000000000145c703	vpsrld	$0x17, %xmm0, %xmm2
000000000145c708	vcvtdq2ps	%xmm2, %xmm2
000000000145c70c	vsubps	%xmm1, %xmm2, %xmm1
000000000145c710	vandps	%xmm7, %xmm0, %xmm0
000000000145c714	vorps	%xmm0, %xmm10, %xmm0
000000000145c718	vmovaps	0xe0(%rsp), %xmm15
000000000145c721	vsubps	%xmm15, %xmm1, %xmm1
000000000145c726	vmovaps	0x180(%rsp), %xmm6
000000000145c72f	vcmpltps	%xmm0, %xmm6, %xmm2
000000000145c734	vandps	%xmm2, %xmm10, %xmm2
000000000145c738	vaddps	%xmm2, %xmm1, %xmm1
000000000145c73c	vmulps	%xmm2, %xmm11, %xmm2
000000000145c740	vmovaps	%xmm11, %xmm14
000000000145c745	vmulps	%xmm0, %xmm2, %xmm2
000000000145c749	vsubps	%xmm10, %xmm0, %xmm0
000000000145c74e	vsubps	%xmm2, %xmm0, %xmm0
000000000145c752	vmulps	%xmm0, %xmm12, %xmm2
000000000145c756	vmovaps	%xmm12, %xmm11
000000000145c75b	vaddps	%xmm2, %xmm8, %xmm2
000000000145c75f	vmulps	%xmm0, %xmm0, %xmm3
000000000145c763	vmulps	%xmm2, %xmm3, %xmm2
000000000145c767	vmovaps	0x160(%rsp), %xmm7
000000000145c770	vmulps	%xmm0, %xmm7, %xmm3
000000000145c774	vaddps	%xmm3, %xmm9, %xmm3
000000000145c778	vdpps	$0xff, 0x80(%r15), %xmm4, %xmm12
000000000145c782	vaddps	%xmm2, %xmm3, %xmm2
000000000145c786	vmulps	%xmm2, %xmm0, %xmm0
000000000145c78a	vaddps	%xmm0, %xmm1, %xmm0
000000000145c78e	vmovaps	%xmm0, 0x2a0(%rsp)
000000000145c797	vandps	%xmm5, %xmm12, %xmm0
000000000145c79b	vmovaps	0x1a0(%rsp), %xmm4
000000000145c7a4	vcmpltps	%xmm4, %xmm0, %xmm1
000000000145c7a9	vmovaps	%xmm13, %xmm5
000000000145c7ad	vandps	%xmm1, %xmm13, %xmm1
000000000145c7b1	vpsrld	$0x17, %xmm0, %xmm2
000000000145c7b6	vcvtdq2ps	%xmm2, %xmm2
000000000145c7ba	vsubps	%xmm1, %xmm2, %xmm1
000000000145c7be	vmovaps	0xc0(%rsp), %xmm9
000000000145c7c7	vandps	%xmm0, %xmm9, %xmm0
000000000145c7cb	vorps	%xmm0, %xmm10, %xmm0
000000000145c7cf	vmovaps	%xmm15, %xmm8
000000000145c7d4	vsubps	%xmm15, %xmm1, %xmm1
000000000145c7d9	vcmpltps	%xmm0, %xmm6, %xmm2
000000000145c7de	vmovaps	%xmm6, %xmm15
000000000145c7e2	vandps	%xmm2, %xmm10, %xmm2
000000000145c7e6	vaddps	%xmm2, %xmm1, %xmm1
000000000145c7ea	vmovaps	%xmm14, %xmm6
000000000145c7ee	vmulps	%xmm2, %xmm14, %xmm2
000000000145c7f2	vmulps	%xmm0, %xmm2, %xmm2
000000000145c7f6	vsubps	%xmm10, %xmm0, %xmm0
000000000145c7fb	vsubps	%xmm2, %xmm0, %xmm0
000000000145c7ff	vmulps	%xmm0, %xmm11, %xmm2
000000000145c803	vmovaps	0x40(%rsp), %xmm13
000000000145c809	vaddps	%xmm2, %xmm13, %xmm2
000000000145c80d	vmulps	%xmm0, %xmm0, %xmm3
000000000145c811	vmulps	%xmm2, %xmm3, %xmm2
000000000145c815	vmulps	%xmm0, %xmm7, %xmm3
000000000145c819	vmovaps	%xmm7, %xmm14
000000000145c81d	vmovaps	(%rsp), %xmm7
000000000145c822	vaddps	%xmm3, %xmm7, %xmm3
000000000145c826	vaddps	%xmm2, %xmm3, %xmm2
000000000145c82a	vmovaps	0x60(%rsp), %xmm3
000000000145c830	vdpps	$0xff, 0xa0(%r15), %xmm3, %xmm12
000000000145c83a	vmulps	%xmm2, %xmm0, %xmm0
000000000145c83e	vaddps	%xmm0, %xmm1, %xmm3
000000000145c842	vandps	0x100(%rsp), %xmm12, %xmm0
000000000145c84b	vcmpltps	%xmm4, %xmm0, %xmm1
000000000145c850	vandps	%xmm5, %xmm1, %xmm1
000000000145c854	vpsrld	$0x17, %xmm0, %xmm2
000000000145c859	vcvtdq2ps	%xmm2, %xmm2
000000000145c85d	vsubps	%xmm1, %xmm2, %xmm1
000000000145c861	vandps	%xmm0, %xmm9, %xmm0
000000000145c865	vmovaps	%xmm9, %xmm4
000000000145c869	vorps	%xmm0, %xmm10, %xmm0
000000000145c86d	vsubps	%xmm8, %xmm1, %xmm1
000000000145c872	vcmpltps	%xmm0, %xmm15, %xmm2
000000000145c877	vandps	%xmm2, %xmm10, %xmm2
000000000145c87b	vaddps	%xmm2, %xmm1, %xmm1
000000000145c87f	vmulps	%xmm2, %xmm6, %xmm2
000000000145c883	vmulps	%xmm0, %xmm2, %xmm2
000000000145c887	vsubps	%xmm10, %xmm0, %xmm0
000000000145c88c	vsubps	%xmm2, %xmm0, %xmm0
000000000145c890	vmulps	%xmm0, %xmm11, %xmm2
000000000145c894	vmovaps	%xmm11, %xmm15
000000000145c899	vaddps	%xmm2, %xmm13, %xmm2
000000000145c89d	vmulps	%xmm0, %xmm0, %xmm12
000000000145c8a1	vmulps	%xmm2, %xmm12, %xmm2
000000000145c8a5	vmulps	%xmm0, %xmm14, %xmm12
000000000145c8a9	vaddps	%xmm7, %xmm12, %xmm12
000000000145c8ad	vaddps	%xmm2, %xmm12, %xmm2
000000000145c8b1	vmulps	%xmm2, %xmm0, %xmm0
000000000145c8b5	vaddps	%xmm0, %xmm1, %xmm0
000000000145c8b9	vmovaps	0x280(%rsp), %xmm5
000000000145c8c2	vmulps	0x2a0(%rsp), %xmm5, %xmm1
000000000145c8cb	vmulps	%xmm3, %xmm5, %xmm2
000000000145c8cf	vmulps	%xmm0, %xmm5, %xmm0
000000000145c8d3	vmovaps	0x20(%rsp), %xmm11
000000000145c8d9	vmaxps	%xmm11, %xmm2, %xmm2
000000000145c8de	vroundps	$0x9, %xmm2, %xmm3
000000000145c8e4	vsubss	%xmm3, %xmm2, %xmm2
000000000145c8e8	vmovaps	0x140(%rsp), %xmm9
000000000145c8f1	vmulss	%xmm2, %xmm9, %xmm5
000000000145c8f5	vmovaps	0x260(%rsp), %xmm12
000000000145c8fe	vaddss	%xmm5, %xmm12, %xmm5
000000000145c902	vmulss	%xmm5, %xmm2, %xmm5
000000000145c906	vmovaps	0x240(%rsp), %xmm13
000000000145c90f	vaddss	%xmm5, %xmm13, %xmm5
000000000145c913	vmulss	%xmm5, %xmm2, %xmm2
000000000145c917	vcvttps2dq	%xmm3, %xmm3
000000000145c91b	vmovdqa	0x80(%rsp), %xmm14
000000000145c924	vpaddd	%xmm3, %xmm14, %xmm3
000000000145c928	vpslld	$0x17, %xmm3, %xmm3
000000000145c92d	vaddss	%xmm2, %xmm10, %xmm2
000000000145c931	vmulss	%xmm3, %xmm2, %xmm2
000000000145c935	vmaxps	%xmm11, %xmm1, %xmm1
000000000145c93a	vroundps	$0x9, %xmm1, %xmm3
000000000145c940	vsubss	%xmm3, %xmm1, %xmm1
000000000145c944	vmulss	%xmm1, %xmm9, %xmm5
000000000145c948	vaddss	%xmm5, %xmm12, %xmm5
000000000145c94c	vmulss	%xmm5, %xmm1, %xmm5
000000000145c950	vaddss	%xmm5, %xmm13, %xmm5
000000000145c954	vmulss	%xmm5, %xmm1, %xmm1
000000000145c958	vcvttps2dq	%xmm3, %xmm3
000000000145c95c	vpaddd	%xmm3, %xmm14, %xmm3
000000000145c960	vpslld	$0x17, %xmm3, %xmm3
000000000145c965	vaddss	%xmm1, %xmm10, %xmm1
000000000145c969	vmulss	%xmm3, %xmm1, %xmm1
000000000145c96d	vaddss	%xmm2, %xmm1, %xmm1
000000000145c971	vmaxps	%xmm11, %xmm0, %xmm0
000000000145c976	vroundps	$0x9, %xmm0, %xmm2
000000000145c97c	vsubss	%xmm2, %xmm0, %xmm0
000000000145c980	vmulss	%xmm0, %xmm9, %xmm3
000000000145c984	vaddss	%xmm3, %xmm12, %xmm3
000000000145c988	vmulss	%xmm3, %xmm0, %xmm3
000000000145c98c	vaddss	%xmm3, %xmm13, %xmm3
000000000145c990	vmulss	%xmm3, %xmm0, %xmm0
000000000145c994	vcvttps2dq	%xmm2, %xmm2
000000000145c998	vpaddd	%xmm2, %xmm14, %xmm2
000000000145c99c	vpslld	$0x17, %xmm2, %xmm2
000000000145c9a1	vaddss	%xmm0, %xmm10, %xmm0
000000000145c9a5	vmulss	%xmm2, %xmm0, %xmm0
000000000145c9a9	vaddss	%xmm0, %xmm1, %xmm0
000000000145c9ad	vshufps	$0x0, %xmm0, %xmm0, %xmm0       ## xmm0 = xmm0[0,0,0,0]
000000000145c9b2	vcmpltps	0x1a0(%rsp), %xmm0, %xmm1
000000000145c9bc	vandps	0x1e0(%rsp), %xmm1, %xmm1
000000000145c9c5	vandps	%xmm0, %xmm4, %xmm2
000000000145c9c9	vpsrld	$0x17, %xmm0, %xmm0
000000000145c9ce	vcvtdq2ps	%xmm0, %xmm0
000000000145c9d2	vsubps	%xmm1, %xmm0, %xmm0
000000000145c9d6	vsubps	%xmm8, %xmm0, %xmm0
000000000145c9db	vorps	%xmm2, %xmm10, %xmm1
000000000145c9df	vmovaps	0x180(%rsp), %xmm2
000000000145c9e8	vcmpltps	%xmm1, %xmm2, %xmm2
000000000145c9ed	vandps	%xmm2, %xmm10, %xmm2
000000000145c9f1	vaddps	%xmm2, %xmm0, %xmm0
000000000145c9f5	vmulps	%xmm2, %xmm6, %xmm2
000000000145c9f9	vmulps	%xmm1, %xmm2, %xmm2
000000000145c9fd	vsubps	%xmm10, %xmm1, %xmm1
000000000145ca02	vsubps	%xmm2, %xmm1, %xmm1
000000000145ca06	vmulps	%xmm1, %xmm15, %xmm2
000000000145ca0a	vaddps	0x40(%rsp), %xmm2, %xmm2
000000000145ca10	vmulps	%xmm1, %xmm1, %xmm3
000000000145ca14	vmulps	%xmm2, %xmm3, %xmm2
000000000145ca18	vmulps	0x160(%rsp), %xmm1, %xmm3
000000000145ca21	vaddps	%xmm3, %xmm7, %xmm3
000000000145ca25	vaddps	%xmm2, %xmm3, %xmm2
000000000145ca29	vmulps	%xmm2, %xmm1, %xmm1
000000000145ca2d	vaddps	%xmm1, %xmm0, %xmm0
000000000145ca31	vmulps	0x200(%rsp), %xmm0, %xmm0
000000000145ca3a	vmaxps	%xmm11, %xmm0, %xmm0
000000000145ca3f	vroundps	$0x9, %xmm0, %xmm1
000000000145ca45	vsubps	%xmm1, %xmm0, %xmm0
000000000145ca49	vmulps	%xmm0, %xmm9, %xmm2
000000000145ca4d	vaddps	%xmm2, %xmm12, %xmm2
000000000145ca51	vmulps	%xmm2, %xmm0, %xmm2
000000000145ca55	vaddps	%xmm2, %xmm13, %xmm2
000000000145ca59	vmulps	%xmm2, %xmm0, %xmm0
000000000145ca5d	vcvttps2dq	%xmm1, %xmm1
000000000145ca61	vpaddd	%xmm1, %xmm14, %xmm1
000000000145ca65	vaddps	%xmm0, %xmm10, %xmm0
000000000145ca69	vpslld	$0x17, %xmm1, %xmm1
000000000145ca6e	vmulps	%xmm1, %xmm0, %xmm0
000000000145ca72	vmovaps	0xa0(%rsp), %xmm2
000000000145ca7b	vsubps	%xmm10, %xmm2, %xmm1
000000000145ca80	vsubss	%xmm0, %xmm2, %xmm2
000000000145ca84	vshufps	$0x0, %xmm2, %xmm2, %xmm2       ## xmm2 = xmm2[0,0,0,0]
000000000145ca89	vrcpps	%xmm2, %xmm2
000000000145ca8d	vmulps	0x380(%r15), %xmm2, %xmm2
000000000145ca96	vmulps	%xmm0, %xmm1, %xmm0
000000000145ca9a	vmulps	%xmm0, %xmm2, %xmm1
000000000145ca9e	vmovaps	0x3a0(%r15), %xmm0
000000000145caa7	vmaxps	%xmm0, %xmm1, %xmm1
000000000145caab	vminps	%xmm10, %xmm1, %xmm1
000000000145cab0	vsubps	%xmm1, %xmm10, %xmm1
000000000145cab4	vmulps	0x100(%r15), %xmm1, %xmm1
000000000145cabd	vaddps	0xe0(%r15), %xmm1, %xmm1
000000000145cac6	vmaxps	%xmm0, %xmm1, %xmm1
000000000145caca	vminps	%xmm10, %xmm1, %xmm1
000000000145cacf	vshufps	$0xff, %xmm1, %xmm1, %xmm1      ## xmm1 = xmm1[3,3,3,3]
000000000145cad4	vmulss	0x2f0(%rsp), %xmm1, %xmm2
000000000145cadd	testl	%eax, %eax
000000000145cadf	jne	0x145b5c0
000000000145cae5	vxorps	%xmm1, %xmm1, %xmm1
000000000145cae9	vmaxss	%xmm1, %xmm2, %xmm1
000000000145caed	vminss	0x230(%rsp), %xmm1, %xmm1
000000000145caf6	vcvttss2si	%xmm1, %esi
000000000145cafa	movq	0x60(%rbx), %r9
000000000145cafe	movslq	%esi, %rsi
000000000145cb01	shlq	$0x4, %rsi
000000000145cb05	vmovaps	(%r9,%rsi), %xmm1
000000000145cb0b	jmp	0x145b61d
000000000145cb10	vzeroupper
000000000145cb13	xorl	%eax, %eax
000000000145cb15	leaq	-0x28(%rbp), %rsp
000000000145cb19	popq	%rbx
000000000145cb1a	popq	%r12
000000000145cb1c	popq	%r13
000000000145cb1e	popq	%r14
000000000145cb20	popq	%r15
000000000145cb22	popq	%rbp
000000000145cb23	retq
000000000145cb24	nopw	%cs:(%rax,%rax)
