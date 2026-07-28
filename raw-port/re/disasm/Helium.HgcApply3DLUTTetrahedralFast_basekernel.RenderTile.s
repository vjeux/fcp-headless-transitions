__ZN39HgcApply3DLUTTetrahedralFast_basekernel10RenderTileEP6HGTile:
000000000038b1a0	pushq	%rbp
000000000038b1a1	movq	%rsp, %rbp
000000000038b1a4	pushq	%r15
000000000038b1a6	pushq	%r14
000000000038b1a8	pushq	%r13
000000000038b1aa	pushq	%r12
000000000038b1ac	pushq	%rbx
000000000038b1ad	subq	$0x108, %rsp                    ## imm = 0x108
000000000038b1b4	movq	%rsi, %rbx
000000000038b1b7	movq	%rdi, %r14
000000000038b1ba	movq	%rsi, %rdi
000000000038b1bd	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
000000000038b1c2	movq	%rax, %rdi
000000000038b1c5	xorl	%esi, %esi
000000000038b1c7	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000038b1cc	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000038b1d1	jb	0x38b1f2
000000000038b1d3	movq	%r14, %rdi
000000000038b1d6	movq	%rbx, %rsi
000000000038b1d9	callq	__ZN39HgcApply3DLUTTetrahedralFast_basekernel14RenderTile_AVXEP6HGTile ## HgcApply3DLUTTetrahedralFast_basekernel::RenderTile_AVX(HGTile*)
000000000038b1de	xorl	%eax, %eax
000000000038b1e0	addq	$0x108, %rsp                    ## imm = 0x108
000000000038b1e7	popq	%rbx
000000000038b1e8	popq	%r12
000000000038b1ea	popq	%r13
000000000038b1ec	popq	%r14
000000000038b1ee	popq	%r15
000000000038b1f0	popq	%rbp
000000000038b1f1	retq
000000000038b1f2	movaps	(%rbx), %xmm0
000000000038b1f5	cvtdq2ps	%xmm0, %xmm2
000000000038b1f8	mulps	0x3eeb1(%rip), %xmm2
000000000038b1ff	addps	0x3eeba(%rip), %xmm2
000000000038b206	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
000000000038b20b	psubd	%xmm0, %xmm1
000000000038b20f	movd	%xmm1, %ecx
000000000038b213	pextrd	$0x1, %xmm1, %edx
000000000038b219	movslq	0x58(%rbx), %rsi
000000000038b21d	movq	%rsi, -0x40(%rbp)
000000000038b221	movq	0x50(%rbx), %rsi
000000000038b225	movq	0x10(%rbx), %rdi
000000000038b229	movslq	0x18(%rbx), %r8
000000000038b22d	movq	%r8, -0x38(%rbp)
000000000038b231	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
000000000038b236	movaps	%xmm2, -0x80(%rbp)
000000000038b23a	movl	%edx, -0x2c(%rbp)
000000000038b23d	jbe	0x38b791
000000000038b243	testl	%edx, %edx
000000000038b245	jle	0x38b1de
000000000038b247	testl	%ecx, %ecx
000000000038b249	jle	0x38b1de
000000000038b24b	movl	%ecx, %eax
000000000038b24d	shlq	$0x4, -0x40(%rbp)
000000000038b252	shlq	$0x4, -0x38(%rbp)
000000000038b257	shlq	$0x4, %rax
000000000038b25b	xorl	%ecx, %ecx
000000000038b25d	movaps	0x3ca0c(%rip), %xmm6
000000000038b264	nopw	%cs:(%rax,%rax)
000000000038b270	movq	%rcx, -0x48(%rbp)
000000000038b274	xorl	%r10d, %r10d
000000000038b277	nopw	(%rax,%rax)
000000000038b280	movaps	(%rsi,%r10), %xmm1
000000000038b285	movaps	%xmm1, -0x130(%rbp)
000000000038b28c	movq	0x198(%r14), %r11
000000000038b293	movaps	(%r11), %xmm2
000000000038b297	movaps	%xmm2, -0x120(%rbp)
000000000038b29e	movaps	%xmm2, %xmm0
000000000038b2a1	shufps	$0x0, %xmm2, %xmm0              ## xmm0 = xmm0[0,0],xmm2[0,0]
000000000038b2a5	mulps	%xmm1, %xmm0
000000000038b2a8	movaps	0x60(%r11), %xmm5
000000000038b2ad	shufps	$0x55, %xmm2, %xmm2             ## xmm2 = xmm2[1,1,1,1]
000000000038b2b1	addps	%xmm0, %xmm2
000000000038b2b4	movaps	%xmm2, %xmm0
000000000038b2b7	mulps	%xmm2, %xmm0
000000000038b2ba	movaps	%xmm5, %xmm3
000000000038b2bd	shufps	$0x55, %xmm5, %xmm3             ## xmm3 = xmm3[1,1],xmm5[1,1]
000000000038b2c1	mulps	%xmm2, %xmm3
000000000038b2c4	movaps	0x20(%r11), %xmm1
000000000038b2c9	movaps	%xmm5, %xmm4
000000000038b2cc	shufps	$0x0, %xmm5, %xmm4              ## xmm4 = xmm4[0,0],xmm5[0,0]
000000000038b2d0	addps	%xmm3, %xmm4
000000000038b2d3	mulps	%xmm0, %xmm2
000000000038b2d6	movaps	%xmm5, %xmm3
000000000038b2d9	shufps	$0xaa, %xmm5, %xmm3             ## xmm3 = xmm3[2,2],xmm5[2,2]
000000000038b2dd	mulps	%xmm0, %xmm3
000000000038b2e0	addps	%xmm4, %xmm3
000000000038b2e3	shufps	$0xff, %xmm5, %xmm5             ## xmm5 = xmm5[3,3,3,3]
000000000038b2e7	mulps	%xmm2, %xmm5
000000000038b2ea	movaps	0x80(%r11), %xmm2
000000000038b2f2	movaps	%xmm2, -0x110(%rbp)
000000000038b2f9	addps	%xmm3, %xmm5
000000000038b2fc	movaps	%xmm1, %xmm0
000000000038b2ff	shufps	$0x55, %xmm1, %xmm0             ## xmm0 = xmm0[1,1],xmm1[1,1]
000000000038b303	movaps	0xa0(%r11), %xmm3
000000000038b30b	maxps	%xmm2, %xmm5
000000000038b30e	subps	%xmm3, %xmm0
000000000038b311	minps	%xmm0, %xmm5
000000000038b314	roundps	$0x9, %xmm5, %xmm2
000000000038b31a	movaps	%xmm3, %xmm12
000000000038b31e	movaps	%xmm3, %xmm14
000000000038b322	movaps	%xmm3, -0x90(%rbp)
000000000038b329	addps	%xmm2, %xmm12
000000000038b32d	minps	%xmm0, %xmm12
000000000038b331	subps	%xmm2, %xmm12
000000000038b335	mulps	%xmm1, %xmm12
000000000038b339	dpps	$0x3f, %xmm2, %xmm1
000000000038b33f	subps	%xmm2, %xmm5
000000000038b342	insertps	$0x90, %xmm2, %xmm1             ## xmm1 = xmm1[0],xmm2[2],xmm1[2,3]
000000000038b348	addps	0xc0(%r11), %xmm1
000000000038b350	movl	0x68(%rbx), %r15d
000000000038b354	movaps	%xmm1, %xmm0
000000000038b357	movaps	-0x80(%rbp), %xmm7
000000000038b35b	subps	%xmm7, %xmm0
000000000038b35e	addps	%xmm6, %xmm0
000000000038b361	roundps	$0x1, %xmm0, %xmm0
000000000038b367	cvtps2dq	%xmm0, %xmm2
000000000038b36b	movq	0x60(%rbx), %r12
000000000038b36f	movd	%xmm2, %edx
000000000038b373	movaps	%xmm1, %xmm0
000000000038b376	addss	%xmm12, %xmm0
000000000038b37b	pextrd	$0x1, %xmm2, %ecx
000000000038b381	movaps	%xmm1, -0x100(%rbp)
000000000038b388	movshdup	%xmm12, %xmm2                   ## xmm2 = xmm12[1,1,3,3]
000000000038b38d	addss	%xmm2, %xmm0
000000000038b391	imull	%r15d, %ecx
000000000038b395	movaps	%xmm1, %xmm3
000000000038b398	blendps	$0x1, %xmm0, %xmm3              ## xmm3 = xmm0[0],xmm3[1,2,3]
000000000038b39e	movaps	%xmm3, -0xf0(%rbp)
000000000038b3a5	subss	%xmm12, %xmm0
000000000038b3aa	addl	%edx, %ecx
000000000038b3ac	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000038b3b2	xorps	%xmm3, %xmm3
000000000038b3b5	unpckhps	%xmm12, %xmm3                   ## xmm3 = xmm3[2],xmm12[2],xmm3[3],xmm12[3]
000000000038b3b9	movslq	%ecx, %rcx
000000000038b3bc	addps	%xmm1, %xmm3
000000000038b3bf	subps	%xmm7, %xmm1
000000000038b3c2	shlq	$0x4, %rcx
000000000038b3c6	addps	%xmm6, %xmm1
000000000038b3c9	roundps	$0x1, %xmm1, %xmm1
000000000038b3cf	cvtps2dq	%xmm1, %xmm1
000000000038b3d3	movaps	(%r12,%rcx), %xmm9
000000000038b3d8	movaps	%xmm9, -0x60(%rbp)
000000000038b3dd	movd	%xmm1, %ecx
000000000038b3e1	movaps	%xmm3, %xmm4
000000000038b3e4	pextrd	$0x1, %xmm1, %edx
000000000038b3ea	blendps	$0x1, %xmm0, %xmm4              ## xmm4 = xmm0[0],xmm4[1,2,3]
000000000038b3f0	subps	%xmm7, %xmm4
000000000038b3f3	addps	%xmm6, %xmm4
000000000038b3f6	imull	%r15d, %edx
000000000038b3fa	roundps	$0x1, %xmm4, %xmm1
000000000038b400	cvtps2dq	%xmm1, %xmm1
000000000038b404	movd	%xmm1, %r8d
000000000038b409	addl	%ecx, %edx
000000000038b40b	pextrd	$0x1, %xmm1, %ecx
000000000038b411	subss	%xmm2, %xmm0
000000000038b415	movslq	%edx, %r9
000000000038b418	movaps	%xmm3, %xmm1
000000000038b41b	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000038b421	subps	%xmm7, %xmm1
000000000038b424	imull	%r15d, %ecx
000000000038b428	addps	%xmm6, %xmm1
000000000038b42b	roundps	$0x1, %xmm1, %xmm1
000000000038b431	cvtps2dq	%xmm1, %xmm1
000000000038b435	shlq	$0x4, %r9
000000000038b439	movd	%xmm1, %r13d
000000000038b43e	pextrd	$0x1, %xmm1, %edx
000000000038b444	movaps	(%r12,%r9), %xmm11
000000000038b449	addss	%xmm12, %xmm0
000000000038b44e	movaps	%xmm3, %xmm1
000000000038b451	blendps	$0x1, %xmm0, %xmm1              ## xmm1 = xmm0[0],xmm1[1,2,3]
000000000038b457	addl	%r8d, %ecx
000000000038b45a	subps	%xmm7, %xmm1
000000000038b45d	addps	%xmm6, %xmm1
000000000038b460	roundps	$0x1, %xmm1, %xmm1
000000000038b466	movslq	%ecx, %rcx
000000000038b469	cvtps2dq	%xmm1, %xmm1
000000000038b46d	extractps	$0x1, %xmm1, %r8d
000000000038b474	shlq	$0x4, %rcx
000000000038b478	addss	%xmm2, %xmm0
000000000038b47c	blendps	$0xe, %xmm3, %xmm0              ## xmm0 = xmm0[0],xmm3[1,2,3]
000000000038b482	subps	%xmm7, %xmm0
000000000038b485	movaps	(%r12,%rcx), %xmm4
000000000038b48a	addps	%xmm6, %xmm0
000000000038b48d	roundps	$0x1, %xmm0, %xmm0
000000000038b493	cvtps2dq	%xmm0, %xmm0
000000000038b497	movd	%xmm0, %ecx
000000000038b49b	pextrd	$0x1, %xmm0, %r9d
000000000038b4a2	imull	%r15d, %r9d
000000000038b4a6	addl	%ecx, %r9d
000000000038b4a9	movd	%xmm1, %ecx
000000000038b4ad	movslq	%r9d, %r9
000000000038b4b0	movaps	%xmm5, %xmm0
000000000038b4b3	shlq	$0x4, %r9
000000000038b4b7	shufps	$0x68, %xmm5, %xmm0             ## xmm0 = xmm0[0,2],xmm5[2,1]
000000000038b4bb	movaps	%xmm5, %xmm8
000000000038b4bf	shufps	$0x91, %xmm5, %xmm8             ## xmm8 = xmm8[1,0],xmm5[1,2]
000000000038b4c4	movaps	(%r12,%r9), %xmm6
000000000038b4c9	movaps	%xmm6, -0x70(%rbp)
000000000038b4cd	cmpltps	%xmm0, %xmm8
000000000038b4d2	movaps	%xmm4, %xmm13
000000000038b4d6	subps	%xmm4, %xmm6
000000000038b4d9	movaps	%xmm11, -0xe0(%rbp)
000000000038b4e1	subps	%xmm11, %xmm13
000000000038b4e5	movaps	%xmm11, %xmm0
000000000038b4e9	subps	%xmm9, %xmm0
000000000038b4ed	movaps	%xmm5, %xmm10
000000000038b4f1	shufps	$0x0, %xmm5, %xmm10             ## xmm10 = xmm10[0,0],xmm5[0,0]
000000000038b4f6	movaps	%xmm5, %xmm11
000000000038b4fa	shufps	$0x55, %xmm5, %xmm11            ## xmm11 = xmm11[1,1],xmm5[1,1]
000000000038b4ff	mulps	%xmm10, %xmm6
000000000038b503	movaps	%xmm10, -0xa0(%rbp)
000000000038b50b	mulps	%xmm11, %xmm0
000000000038b50f	movaps	%xmm0, %xmm1
000000000038b512	movaps	%xmm0, -0xb0(%rbp)
000000000038b519	movshdup	%xmm5, %xmm0                    ## xmm0 = xmm5[1,1,3,3]
000000000038b51d	movaps	%xmm0, -0xd0(%rbp)
000000000038b524	movaps	%xmm5, -0xc0(%rbp)
000000000038b52b	movaps	%xmm5, %xmm9
000000000038b52f	movaps	%xmm5, %xmm15
000000000038b533	shufps	$0xaa, %xmm5, %xmm5             ## xmm5 = xmm5[2,2,2,2]
000000000038b537	movaps	%xmm1, %xmm0
000000000038b53a	addps	%xmm6, %xmm0
000000000038b53d	mulps	%xmm5, %xmm13
000000000038b541	addps	%xmm0, %xmm13
000000000038b545	andps	%xmm14, %xmm8
000000000038b549	pshufd	$0x0, %xmm8, %xmm0              ## xmm0 = xmm8[0,0,0,0]
000000000038b54f	pshufd	$0x55, %xmm8, %xmm2             ## xmm2 = xmm8[1,1,1,1]
000000000038b555	minps	%xmm2, %xmm0
000000000038b558	imull	%r15d, %edx
000000000038b55c	addl	%r13d, %edx
000000000038b55f	movslq	%edx, %rdx
000000000038b562	shlq	$0x4, %rdx
000000000038b566	imull	%r15d, %r8d
000000000038b56a	addl	%ecx, %r8d
000000000038b56d	movslq	%r8d, %rcx
000000000038b570	shlq	$0x4, %rcx
000000000038b574	movaps	(%r12,%rdx), %xmm3
000000000038b579	movaps	(%r12,%rcx), %xmm7
000000000038b57e	movaps	%xmm7, %xmm2
000000000038b581	subps	%xmm3, %xmm2
000000000038b584	movaps	-0x70(%rbp), %xmm14
000000000038b589	subps	%xmm7, %xmm14
000000000038b58d	movaps	%xmm3, %xmm1
000000000038b590	subps	-0x60(%rbp), %xmm1
000000000038b594	mulps	%xmm10, %xmm2
000000000038b598	mulps	%xmm11, %xmm14
000000000038b59c	addps	%xmm14, %xmm2
000000000038b5a0	mulps	%xmm5, %xmm1
000000000038b5a3	movaps	-0x110(%rbp), %xmm10
000000000038b5ab	cmpnleps	%xmm10, %xmm0
000000000038b5b0	addps	%xmm1, %xmm2
000000000038b5b3	blendvps	%xmm0, %xmm2, %xmm13
000000000038b5b9	subps	%xmm3, %xmm4
000000000038b5bc	shufps	$0x81, %xmm9, %xmm9             ## xmm9 = xmm9[1,0,0,2]
000000000038b5c1	shufps	$0x64, %xmm15, %xmm15           ## xmm15 = xmm15[0,1,2,1]
000000000038b5c6	cmpleps	%xmm9, %xmm15
000000000038b5cb	movaps	-0x80(%rbp), %xmm2
000000000038b5cf	mulps	%xmm11, %xmm4
000000000038b5d3	addps	%xmm6, %xmm4
000000000038b5d6	addps	%xmm1, %xmm4
000000000038b5d9	andps	-0x90(%rbp), %xmm15
000000000038b5e1	pshufd	$0x0, %xmm15, %xmm0             ## xmm0 = xmm15[0,0,0,0]
000000000038b5e7	pshufd	$0xaa, %xmm8, %xmm1             ## xmm1 = xmm8[2,2,2,2]
000000000038b5ed	minps	%xmm1, %xmm0
000000000038b5f0	cmpnleps	%xmm10, %xmm0
000000000038b5f5	blendvps	%xmm0, %xmm4, %xmm13
000000000038b5fb	movaps	-0x100(%rbp), %xmm0
000000000038b602	addss	%xmm12, %xmm0
000000000038b607	subps	%xmm2, %xmm0
000000000038b60a	addps	0x3c65f(%rip), %xmm0
000000000038b611	roundps	$0x1, %xmm0, %xmm0
000000000038b617	cvtps2dq	%xmm0, %xmm0
000000000038b61b	movd	%xmm0, %ecx
000000000038b61f	pextrd	$0x1, %xmm0, %edx
000000000038b625	movaps	-0xf0(%rbp), %xmm0
000000000038b62c	subps	%xmm2, %xmm0
000000000038b62f	addps	0x3c63a(%rip), %xmm0
000000000038b636	roundps	$0x1, %xmm0, %xmm0
000000000038b63c	cvtps2dq	%xmm0, %xmm0
000000000038b640	extractps	$0x1, %xmm0, %r8d
000000000038b647	movd	%xmm0, %r9d
000000000038b64c	imull	%r15d, %edx
000000000038b650	addl	%ecx, %edx
000000000038b652	imull	%r15d, %r8d
000000000038b656	addl	%r9d, %r8d
000000000038b659	movslq	%edx, %rcx
000000000038b65c	shlq	$0x4, %rcx
000000000038b660	movslq	%r8d, %rdx
000000000038b663	shlq	$0x4, %rdx
000000000038b667	movaps	(%r12,%rcx), %xmm9
000000000038b66c	movaps	(%r12,%rdx), %xmm6
000000000038b671	movaps	%xmm6, %xmm2
000000000038b674	subps	%xmm9, %xmm2
000000000038b678	mulps	%xmm11, %xmm2
000000000038b67c	pshufd	$0xff, %xmm8, %xmm0             ## xmm0 = xmm8[3,3,3,3]
000000000038b682	pshufd	$0x55, %xmm15, %xmm3            ## xmm3 = xmm15[1,1,1,1]
000000000038b688	minps	%xmm3, %xmm0
000000000038b68b	movaps	-0x70(%rbp), %xmm4
000000000038b68f	subps	%xmm6, %xmm4
000000000038b692	movaps	%xmm9, %xmm3
000000000038b696	movaps	-0x60(%rbp), %xmm11
000000000038b69b	subps	%xmm11, %xmm3
000000000038b69f	movaps	-0xa0(%rbp), %xmm1
000000000038b6a6	mulps	%xmm1, %xmm3
000000000038b6a9	addps	%xmm3, %xmm2
000000000038b6ac	mulps	%xmm5, %xmm4
000000000038b6af	addps	%xmm4, %xmm2
000000000038b6b2	movaps	%xmm4, %xmm12
000000000038b6b6	cmpnleps	%xmm10, %xmm0
000000000038b6bb	blendvps	%xmm0, %xmm2, %xmm13
000000000038b6c1	movaps	-0xc0(%rbp), %xmm0
000000000038b6c8	cmpltss	-0xd0(%rbp), %xmm0
000000000038b6d1	andps	-0x90(%rbp), %xmm0
000000000038b6d8	subps	-0xe0(%rbp), %xmm6
000000000038b6df	mulps	%xmm1, %xmm6
000000000038b6e2	addps	-0xb0(%rbp), %xmm6
000000000038b6e9	pshufd	$0xaa, %xmm15, %xmm2            ## xmm2 = xmm15[2,2,2,2]
000000000038b6ef	pshufd	$0x0, %xmm0, %xmm4              ## xmm4 = xmm0[0,0,0,0]
000000000038b6f4	addps	%xmm12, %xmm6
000000000038b6f8	movdqa	%xmm2, %xmm0
000000000038b6fc	minps	%xmm4, %xmm0
000000000038b6ff	cmpnleps	%xmm10, %xmm0
000000000038b704	blendvps	%xmm0, %xmm6, %xmm13
000000000038b70a	movaps	0x3c55f(%rip), %xmm6
000000000038b711	subps	%xmm9, %xmm7
000000000038b715	pshufd	$0xff, %xmm15, %xmm0            ## xmm0 = xmm15[3,3,3,3]
000000000038b71b	minps	%xmm2, %xmm0
000000000038b71e	addps	%xmm14, %xmm3
000000000038b722	mulps	%xmm5, %xmm7
000000000038b725	addps	%xmm3, %xmm7
000000000038b728	cmpnleps	%xmm10, %xmm0
000000000038b72d	blendvps	%xmm0, %xmm7, %xmm13
000000000038b733	addps	%xmm11, %xmm13
000000000038b737	movaps	-0x120(%rbp), %xmm1
000000000038b73e	movaps	%xmm1, %xmm0
000000000038b741	shufps	$0xaa, %xmm1, %xmm0             ## xmm0 = xmm0[2,2],xmm1[2,2]
000000000038b745	mulps	%xmm13, %xmm0
000000000038b749	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
000000000038b74d	addps	%xmm0, %xmm1
000000000038b750	movaps	0x40(%r11), %xmm0
000000000038b755	cmpltps	%xmm10, %xmm0
000000000038b75a	blendvps	%xmm0, -0x130(%rbp), %xmm1
000000000038b763	movaps	%xmm1, (%rdi,%r10)
000000000038b768	addq	$0x10, %r10
000000000038b76c	cmpq	%r10, %rax
000000000038b76f	jne	0x38b280
000000000038b775	movq	-0x48(%rbp), %rcx
000000000038b779	incl	%ecx
000000000038b77b	addq	-0x40(%rbp), %rsi
000000000038b77f	addq	-0x38(%rbp), %rdi
000000000038b783	cmpl	-0x2c(%rbp), %ecx
000000000038b786	jne	0x38b270
000000000038b78c	jmp	0x38b1de
000000000038b791	testl	%edx, %edx
000000000038b793	jle	0x38b1de
000000000038b799	testl	%ecx, %ecx
000000000038b79b	jle	0x38b1de
000000000038b7a1	movl	%ecx, %eax
000000000038b7a3	shlq	$0x4, -0x40(%rbp)
000000000038b7a8	shlq	$0x4, -0x38(%rbp)
000000000038b7ad	shlq	$0x4, %rax
000000000038b7b1	xorl	%ecx, %ecx
000000000038b7b3	nopw	%cs:(%rax,%rax)
000000000038b7c0	movq	%rcx, -0x48(%rbp)
000000000038b7c4	xorl	%r10d, %r10d
000000000038b7c7	nopw	(%rax,%rax)
000000000038b7d0	movaps	(%rsi,%r10), %xmm1
000000000038b7d5	movaps	%xmm1, -0x90(%rbp)
000000000038b7dc	movq	0x198(%r14), %r11
000000000038b7e3	movaps	(%r11), %xmm2
000000000038b7e7	movaps	%xmm2, -0x130(%rbp)
000000000038b7ee	movaps	%xmm2, %xmm0
000000000038b7f1	shufps	$0x0, %xmm2, %xmm0              ## xmm0 = xmm0[0,0],xmm2[0,0]
000000000038b7f5	mulps	%xmm1, %xmm0
000000000038b7f8	movaps	%xmm2, %xmm1
000000000038b7fb	shufps	$0x55, %xmm2, %xmm1             ## xmm1 = xmm1[1,1],xmm2[1,1]
000000000038b7ff	movaps	0x60(%r11), %xmm7
000000000038b804	addps	%xmm0, %xmm1
000000000038b807	movaps	%xmm1, %xmm2
000000000038b80a	mulps	%xmm1, %xmm2
000000000038b80d	movaps	0x20(%r11), %xmm0
000000000038b812	movaps	%xmm7, %xmm3
000000000038b815	shufps	$0x55, %xmm7, %xmm3             ## xmm3 = xmm3[1,1],xmm7[1,1]
000000000038b819	mulps	%xmm1, %xmm3
000000000038b81c	mulps	%xmm2, %xmm1
000000000038b81f	movaps	%xmm7, %xmm4
000000000038b822	shufps	$0x0, %xmm7, %xmm4              ## xmm4 = xmm4[0,0],xmm7[0,0]
000000000038b826	movaps	%xmm7, %xmm5
000000000038b829	addps	%xmm3, %xmm4
000000000038b82c	shufps	$0xaa, %xmm7, %xmm5             ## xmm5 = xmm5[2,2],xmm7[2,2]
000000000038b830	mulps	%xmm2, %xmm5
000000000038b833	shufps	$0xff, %xmm7, %xmm7             ## xmm7 = xmm7[3,3,3,3]
000000000038b837	addps	%xmm4, %xmm5
000000000038b83a	mulps	%xmm1, %xmm7
000000000038b83d	movaps	0x80(%r11), %xmm2
000000000038b845	movaps	%xmm2, -0x70(%rbp)
000000000038b849	movaps	%xmm0, %xmm1
000000000038b84c	addps	%xmm5, %xmm7
000000000038b84f	shufps	$0x55, %xmm0, %xmm1             ## xmm1 = xmm1[1,1],xmm0[1,1]
000000000038b853	movaps	0xa0(%r11), %xmm4
000000000038b85b	subps	%xmm4, %xmm1
000000000038b85e	maxps	%xmm2, %xmm7
000000000038b861	minps	%xmm1, %xmm7
000000000038b864	cvtps2dq	%xmm7, %xmm2
000000000038b868	cvtdq2ps	%xmm2, %xmm2
000000000038b86b	movaps	%xmm7, %xmm3
000000000038b86e	cmpltps	%xmm2, %xmm3
000000000038b872	cvtdq2ps	%xmm3, %xmm3
000000000038b875	addps	%xmm2, %xmm3
000000000038b878	subps	%xmm3, %xmm7
000000000038b87b	movaps	%xmm4, %xmm2
000000000038b87e	movaps	%xmm4, %xmm14
000000000038b882	movaps	%xmm4, -0xa0(%rbp)
000000000038b889	addps	%xmm3, %xmm2
000000000038b88c	minps	%xmm1, %xmm2
000000000038b88f	subps	%xmm3, %xmm2
000000000038b892	mulps	%xmm0, %xmm2
000000000038b895	movaps	%xmm2, %xmm4
000000000038b898	mulps	%xmm3, %xmm0
000000000038b89b	movshdup	%xmm0, %xmm2                    ## xmm2 = xmm0[1,1,3,3]
000000000038b89f	addps	%xmm0, %xmm2
000000000038b8a2	blendps	$0xc, %xmm3, %xmm2              ## xmm2 = xmm2[0,1],xmm3[2,3]
000000000038b8a8	shufps	$0xf8, %xmm2, %xmm2             ## xmm2 = xmm2[0,2,3,3]
000000000038b8ac	addps	0xc0(%r11), %xmm2
000000000038b8b4	movq	0x60(%rbx), %r15
000000000038b8b8	movl	0x68(%rbx), %r12d
000000000038b8bc	movaps	%xmm2, %xmm0
000000000038b8bf	movaps	-0x80(%rbp), %xmm9
000000000038b8c4	subps	%xmm9, %xmm0
000000000038b8c8	movaps	0x3c3a0(%rip), %xmm8
000000000038b8d0	addps	%xmm8, %xmm0
000000000038b8d4	cvtps2dq	%xmm0, %xmm1
000000000038b8d8	cvtdq2ps	%xmm1, %xmm3
000000000038b8db	cmpltps	%xmm3, %xmm0
000000000038b8df	paddd	%xmm1, %xmm0
000000000038b8e3	movd	%xmm0, %edx
000000000038b8e7	pextrd	$0x1, %xmm0, %ecx
000000000038b8ed	movaps	%xmm2, %xmm0
000000000038b8f0	addss	%xmm4, %xmm0
000000000038b8f4	movaps	%xmm2, -0x120(%rbp)
000000000038b8fb	imull	%r12d, %ecx
000000000038b8ff	movshdup	%xmm4, %xmm1                    ## xmm1 = xmm4[1,1,3,3]
000000000038b903	addss	%xmm1, %xmm0
000000000038b907	movaps	%xmm2, %xmm3
000000000038b90a	addl	%edx, %ecx
000000000038b90c	blendps	$0x1, %xmm0, %xmm3              ## xmm3 = xmm0[0],xmm3[1,2,3]
000000000038b912	movaps	%xmm3, -0x110(%rbp)
000000000038b919	subss	%xmm4, %xmm0
000000000038b91d	blendps	$0x1, %xmm0, %xmm2              ## xmm2 = xmm0[0],xmm2[1,2,3]
000000000038b923	movslq	%ecx, %rcx
000000000038b926	xorps	%xmm3, %xmm3
000000000038b929	unpckhps	%xmm4, %xmm3                    ## xmm3 = xmm3[2],xmm4[2],xmm3[3],xmm4[3]
000000000038b92c	movaps	%xmm4, %xmm6
000000000038b92f	movaps	%xmm4, -0x100(%rbp)
000000000038b936	addps	%xmm2, %xmm3
000000000038b939	shlq	$0x4, %rcx
000000000038b93d	subps	%xmm9, %xmm2
000000000038b941	addps	%xmm8, %xmm2
000000000038b945	movaps	(%r15,%rcx), %xmm10
000000000038b94a	cvtps2dq	%xmm2, %xmm4
000000000038b94e	cvtdq2ps	%xmm4, %xmm5
000000000038b951	cmpltps	%xmm5, %xmm2
000000000038b955	paddd	%xmm4, %xmm2
000000000038b959	movd	%xmm2, %edx
000000000038b95d	movaps	%xmm3, %xmm4
000000000038b960	pextrd	$0x1, %xmm2, %ecx
000000000038b966	blendps	$0x1, %xmm0, %xmm4              ## xmm4 = xmm0[0],xmm4[1,2,3]
000000000038b96c	subps	%xmm9, %xmm4
000000000038b970	addps	%xmm8, %xmm4
000000000038b974	imull	%r12d, %ecx
000000000038b978	cvtps2dq	%xmm4, %xmm2
000000000038b97c	cvtdq2ps	%xmm2, %xmm5
000000000038b97f	cmpltps	%xmm5, %xmm4
000000000038b983	paddd	%xmm2, %xmm4
000000000038b987	subss	%xmm1, %xmm0
000000000038b98b	movaps	%xmm3, %xmm2
000000000038b98e	blendps	$0x1, %xmm0, %xmm2              ## xmm2 = xmm0[0],xmm2[1,2,3]
000000000038b994	movd	%xmm4, %r8d
000000000038b999	subps	%xmm9, %xmm2
000000000038b99d	addps	%xmm8, %xmm2
000000000038b9a1	pextrd	$0x1, %xmm4, %r9d
000000000038b9a8	cvtps2dq	%xmm2, %xmm4
000000000038b9ac	cvtdq2ps	%xmm4, %xmm5
000000000038b9af	cmpltps	%xmm5, %xmm2
000000000038b9b3	addl	%edx, %ecx
000000000038b9b5	paddd	%xmm4, %xmm2
000000000038b9b9	addss	%xmm6, %xmm0
000000000038b9bd	movaps	%xmm3, %xmm4
000000000038b9c0	movslq	%ecx, %rcx
000000000038b9c3	blendps	$0x1, %xmm0, %xmm4              ## xmm4 = xmm0[0],xmm4[1,2,3]
000000000038b9c9	subps	%xmm9, %xmm4
000000000038b9cd	addps	%xmm8, %xmm4
000000000038b9d1	shlq	$0x4, %rcx
000000000038b9d5	cvtps2dq	%xmm4, %xmm5
000000000038b9d9	cvtdq2ps	%xmm5, %xmm6
000000000038b9dc	cmpltps	%xmm6, %xmm4
000000000038b9e0	movaps	(%r15,%rcx), %xmm15
000000000038b9e5	imull	%r12d, %r9d
000000000038b9e9	pextrd	$0x1, %xmm2, %edx
000000000038b9ef	addl	%r8d, %r9d
000000000038b9f2	paddd	%xmm5, %xmm4
000000000038b9f6	pextrd	$0x1, %xmm4, %r13d
000000000038b9fd	movslq	%r9d, %rcx
000000000038ba00	movd	%xmm2, %r8d
000000000038ba05	addss	%xmm1, %xmm0
000000000038ba09	blendps	$0xe, %xmm3, %xmm0              ## xmm0 = xmm0[0],xmm3[1,2,3]
000000000038ba0f	shlq	$0x4, %rcx
000000000038ba13	subps	%xmm9, %xmm0
000000000038ba17	addps	%xmm8, %xmm0
000000000038ba1b	cvtps2dq	%xmm0, %xmm1
000000000038ba1f	movaps	(%r15,%rcx), %xmm6
000000000038ba24	cvtdq2ps	%xmm1, %xmm2
000000000038ba27	cmpltps	%xmm2, %xmm0
000000000038ba2b	paddd	%xmm1, %xmm0
000000000038ba2f	movd	%xmm0, %ecx
000000000038ba33	pextrd	$0x1, %xmm0, %r9d
000000000038ba3a	imull	%r12d, %r9d
000000000038ba3e	addl	%ecx, %r9d
000000000038ba41	movd	%xmm4, %ecx
000000000038ba45	movslq	%r9d, %r9
000000000038ba48	movaps	%xmm7, %xmm0
000000000038ba4b	shlq	$0x4, %r9
000000000038ba4f	shufps	$0x68, %xmm7, %xmm0             ## xmm0 = xmm0[0,2],xmm7[2,1]
000000000038ba53	movaps	%xmm7, %xmm8
000000000038ba57	shufps	$0x91, %xmm7, %xmm8             ## xmm8 = xmm8[1,0],xmm7[1,2]
000000000038ba5c	movaps	(%r15,%r9), %xmm12
000000000038ba61	cmpltps	%xmm0, %xmm8
000000000038ba66	movaps	%xmm12, %xmm11
000000000038ba6a	movaps	%xmm6, %xmm13
000000000038ba6e	subps	%xmm6, %xmm11
000000000038ba72	movaps	%xmm15, -0xf0(%rbp)
000000000038ba7a	subps	%xmm15, %xmm13
000000000038ba7e	movaps	%xmm15, %xmm0
000000000038ba82	movaps	%xmm10, %xmm4
000000000038ba86	movaps	%xmm10, -0xb0(%rbp)
000000000038ba8e	subps	%xmm10, %xmm0
000000000038ba92	movaps	%xmm7, %xmm1
000000000038ba95	shufps	$0x0, %xmm7, %xmm1              ## xmm1 = xmm1[0,0],xmm7[0,0]
000000000038ba99	movaps	%xmm1, -0x60(%rbp)
000000000038ba9d	movaps	%xmm7, %xmm9
000000000038baa1	shufps	$0x55, %xmm7, %xmm9             ## xmm9 = xmm9[1,1],xmm7[1,1]
000000000038baa6	mulps	%xmm1, %xmm11
000000000038baaa	mulps	%xmm9, %xmm0
000000000038baae	movaps	%xmm0, %xmm1
000000000038bab1	movaps	%xmm0, -0xc0(%rbp)
000000000038bab8	movshdup	%xmm7, %xmm0                    ## xmm0 = xmm7[1,1,3,3]
000000000038babc	movaps	%xmm0, -0xe0(%rbp)
000000000038bac3	movaps	%xmm7, -0xd0(%rbp)
000000000038baca	movaps	%xmm7, %xmm10
000000000038bace	movaps	%xmm7, %xmm15
000000000038bad2	shufps	$0xaa, %xmm7, %xmm7             ## xmm7 = xmm7[2,2,2,2]
000000000038bad6	movaps	%xmm1, %xmm0
000000000038bad9	addps	%xmm11, %xmm0
000000000038badd	mulps	%xmm7, %xmm13
000000000038bae1	addps	%xmm0, %xmm13
000000000038bae5	andps	%xmm14, %xmm8
000000000038bae9	pshufd	$0x0, %xmm8, %xmm0              ## xmm0 = xmm8[0,0,0,0]
000000000038baef	pshufd	$0x55, %xmm8, %xmm1             ## xmm1 = xmm8[1,1,1,1]
000000000038baf5	minps	%xmm1, %xmm0
000000000038baf8	imull	%r12d, %edx
000000000038bafc	addl	%r8d, %edx
000000000038baff	movslq	%edx, %rdx
000000000038bb02	shlq	$0x4, %rdx
000000000038bb06	imull	%r12d, %r13d
000000000038bb0a	addl	%ecx, %r13d
000000000038bb0d	movslq	%r13d, %rcx
000000000038bb10	shlq	$0x4, %rcx
000000000038bb14	movaps	(%r15,%rdx), %xmm3
000000000038bb19	movaps	(%r15,%rcx), %xmm5
000000000038bb1e	movaps	%xmm5, %xmm1
000000000038bb21	subps	%xmm3, %xmm1
000000000038bb24	movaps	%xmm12, %xmm14
000000000038bb28	subps	%xmm5, %xmm14
000000000038bb2c	movaps	%xmm3, %xmm2
000000000038bb2f	subps	%xmm4, %xmm2
000000000038bb32	mulps	-0x60(%rbp), %xmm1
000000000038bb36	mulps	%xmm9, %xmm14
000000000038bb3a	addps	%xmm14, %xmm1
000000000038bb3e	mulps	%xmm7, %xmm2
000000000038bb41	movaps	-0x70(%rbp), %xmm4
000000000038bb45	cmpleps	%xmm4, %xmm0
000000000038bb49	addps	%xmm2, %xmm1
000000000038bb4c	blendvps	%xmm0, %xmm13, %xmm1
000000000038bb52	movaps	0x3c116(%rip), %xmm13
000000000038bb5a	subps	%xmm3, %xmm6
000000000038bb5d	shufps	$0x81, %xmm10, %xmm10           ## xmm10 = xmm10[1,0,0,2]
000000000038bb62	shufps	$0x64, %xmm15, %xmm15           ## xmm15 = xmm15[0,1,2,1]
000000000038bb67	cmpleps	%xmm10, %xmm15
000000000038bb6c	mulps	%xmm9, %xmm6
000000000038bb70	addps	%xmm11, %xmm6
000000000038bb74	addps	%xmm2, %xmm6
000000000038bb77	movaps	-0xa0(%rbp), %xmm11
000000000038bb7f	andps	%xmm11, %xmm15
000000000038bb83	pshufd	$0x0, %xmm15, %xmm0             ## xmm0 = xmm15[0,0,0,0]
000000000038bb89	pshufd	$0xaa, %xmm8, %xmm2             ## xmm2 = xmm8[2,2,2,2]
000000000038bb8f	minps	%xmm2, %xmm0
000000000038bb92	cmpleps	%xmm4, %xmm0
000000000038bb96	blendvps	%xmm0, %xmm1, %xmm6
000000000038bb9b	movaps	-0x120(%rbp), %xmm2
000000000038bba2	addss	-0x100(%rbp), %xmm2
000000000038bbaa	subps	-0x80(%rbp), %xmm2
000000000038bbae	addps	%xmm13, %xmm2
000000000038bbb2	cvtps2dq	%xmm2, %xmm0
000000000038bbb6	cvtdq2ps	%xmm0, %xmm1
000000000038bbb9	cmpltps	%xmm1, %xmm2
000000000038bbbd	paddd	%xmm0, %xmm2
000000000038bbc1	movd	%xmm2, %ecx
000000000038bbc5	pextrd	$0x1, %xmm2, %edx
000000000038bbcb	movaps	-0x110(%rbp), %xmm2
000000000038bbd2	subps	-0x80(%rbp), %xmm2
000000000038bbd6	addps	%xmm13, %xmm2
000000000038bbda	cvtps2dq	%xmm2, %xmm0
000000000038bbde	cvtdq2ps	%xmm0, %xmm1
000000000038bbe1	cmpltps	%xmm1, %xmm2
000000000038bbe5	paddd	%xmm0, %xmm2
000000000038bbe9	pextrd	$0x1, %xmm2, %r8d
000000000038bbf0	movd	%xmm2, %r9d
000000000038bbf5	imull	%r12d, %edx
000000000038bbf9	addl	%ecx, %edx
000000000038bbfb	imull	%r12d, %r8d
000000000038bbff	addl	%r9d, %r8d
000000000038bc02	movslq	%edx, %rcx
000000000038bc05	shlq	$0x4, %rcx
000000000038bc09	movslq	%r8d, %rdx
000000000038bc0c	shlq	$0x4, %rdx
000000000038bc10	movaps	(%r15,%rcx), %xmm1
000000000038bc15	movaps	(%r15,%rdx), %xmm4
000000000038bc1a	movaps	%xmm4, %xmm10
000000000038bc1e	subps	%xmm1, %xmm10
000000000038bc22	mulps	%xmm9, %xmm10
000000000038bc26	pshufd	$0xff, %xmm8, %xmm0             ## xmm0 = xmm8[3,3,3,3]
000000000038bc2c	pshufd	$0x55, %xmm15, %xmm2            ## xmm2 = xmm15[1,1,1,1]
000000000038bc32	minps	%xmm2, %xmm0
000000000038bc35	subps	%xmm4, %xmm12
000000000038bc39	movaps	%xmm1, %xmm3
000000000038bc3c	movaps	-0xb0(%rbp), %xmm9
000000000038bc44	subps	%xmm9, %xmm3
000000000038bc48	movaps	-0x60(%rbp), %xmm2
000000000038bc4c	mulps	%xmm2, %xmm3
000000000038bc4f	addps	%xmm3, %xmm10
000000000038bc53	mulps	%xmm7, %xmm12
000000000038bc57	addps	%xmm12, %xmm10
000000000038bc5b	movaps	-0x70(%rbp), %xmm8
000000000038bc60	cmpleps	%xmm8, %xmm0
000000000038bc65	blendvps	%xmm0, %xmm6, %xmm10
000000000038bc6b	movaps	-0xd0(%rbp), %xmm0
000000000038bc72	cmpltss	-0xe0(%rbp), %xmm0
000000000038bc7b	andps	%xmm11, %xmm0
000000000038bc7f	subps	-0xf0(%rbp), %xmm4
000000000038bc86	mulps	%xmm2, %xmm4
000000000038bc89	addps	-0xc0(%rbp), %xmm4
000000000038bc90	pshufd	$0xaa, %xmm15, %xmm2            ## xmm2 = xmm15[2,2,2,2]
000000000038bc96	pshufd	$0x0, %xmm0, %xmm6              ## xmm6 = xmm0[0,0,0,0]
000000000038bc9b	addps	%xmm12, %xmm4
000000000038bc9f	movdqa	%xmm2, %xmm0
000000000038bca3	minps	%xmm6, %xmm0
000000000038bca6	cmpleps	%xmm8, %xmm0
000000000038bcab	blendvps	%xmm0, %xmm10, %xmm4
000000000038bcb1	subps	%xmm1, %xmm5
000000000038bcb4	pshufd	$0xff, %xmm15, %xmm0            ## xmm0 = xmm15[3,3,3,3]
000000000038bcba	minps	%xmm2, %xmm0
000000000038bcbd	addps	%xmm14, %xmm3
000000000038bcc1	mulps	%xmm7, %xmm5
000000000038bcc4	addps	%xmm3, %xmm5
000000000038bcc7	cmpleps	%xmm8, %xmm0
000000000038bccc	blendvps	%xmm0, %xmm4, %xmm5
000000000038bcd1	addps	%xmm9, %xmm5
000000000038bcd5	movaps	-0x130(%rbp), %xmm1
000000000038bcdc	movaps	%xmm1, %xmm0
000000000038bcdf	shufps	$0xaa, %xmm1, %xmm0             ## xmm0 = xmm0[2,2],xmm1[2,2]
000000000038bce3	mulps	%xmm5, %xmm0
000000000038bce6	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
000000000038bcea	addps	%xmm0, %xmm1
000000000038bced	movaps	%xmm1, %xmm2
000000000038bcf0	movaps	0x40(%r11), %xmm0
000000000038bcf5	cmpnltps	%xmm8, %xmm0
000000000038bcfa	movaps	-0x90(%rbp), %xmm1
000000000038bd01	blendvps	%xmm0, %xmm2, %xmm1
000000000038bd06	movaps	%xmm1, (%rdi,%r10)
000000000038bd0b	addq	$0x10, %r10
000000000038bd0f	cmpq	%r10, %rax
000000000038bd12	jne	0x38b7d0
000000000038bd18	movq	-0x48(%rbp), %rcx
000000000038bd1c	incl	%ecx
000000000038bd1e	addq	-0x40(%rbp), %rsi
000000000038bd22	addq	-0x38(%rbp), %rdi
000000000038bd26	cmpl	-0x2c(%rbp), %ecx
000000000038bd29	jne	0x38b7c0
000000000038bd2f	jmp	0x38b1de
000000000038bd34	nopw	%cs:(%rax,%rax)
