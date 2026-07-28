__ZN20HgcAVAMotionDilation10RenderTileEP6HGTile:
00000000002161e0	pushq	%rbp
00000000002161e1	movq	%rsp, %rbp
00000000002161e4	pushq	%r15
00000000002161e6	pushq	%r14
00000000002161e8	pushq	%r13
00000000002161ea	pushq	%r12
00000000002161ec	pushq	%rbx
00000000002161ed	pushq	%rax
00000000002161ee	movq	%rsi, %r14
00000000002161f1	movq	%rdi, %rbx
00000000002161f4	movq	%rsi, %rdi
00000000002161f7	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000002161fc	movq	%rax, %rdi
00000000002161ff	xorl	%esi, %esi
0000000000216201	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
0000000000216206	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000021620b	jb	0x216229
000000000021620d	movq	%rbx, %rdi
0000000000216210	movq	%r14, %rsi
0000000000216213	callq	__ZN20HgcAVAMotionDilation14RenderTile_AVXEP6HGTile ## HgcAVAMotionDilation::RenderTile_AVX(HGTile*)
0000000000216218	xorl	%eax, %eax
000000000021621a	addq	$0x8, %rsp
000000000021621e	popq	%rbx
000000000021621f	popq	%r12
0000000000216221	popq	%r13
0000000000216223	popq	%r14
0000000000216225	popq	%r15
0000000000216227	popq	%rbp
0000000000216228	retq
0000000000216229	movl	0x8(%r14), %r15d
000000000021622d	subl	(%r14), %r15d
0000000000216230	movl	0xc(%r14), %ecx
0000000000216234	subl	0x4(%r14), %ecx
0000000000216238	movslq	0x58(%r14), %rdx
000000000021623c	movq	%rdx, -0x30(%rbp)
0000000000216240	movq	0x50(%r14), %rsi
0000000000216244	movslq	0x68(%r14), %rdi
0000000000216248	movq	0x60(%r14), %r12
000000000021624c	movslq	0x78(%r14), %r8
0000000000216250	movq	0x70(%r14), %r9
0000000000216254	movq	0x10(%r14), %r10
0000000000216258	movslq	0x18(%r14), %r11
000000000021625c	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
0000000000216261	jbe	0x2163af
0000000000216267	testl	%ecx, %ecx
0000000000216269	jle	0x216218
000000000021626b	testl	%r15d, %r15d
000000000021626e	jle	0x216218
0000000000216270	movl	%r15d, %eax
0000000000216273	shlq	$0x4, %rdi
0000000000216277	leaq	(%rdi,%r12), %r14
000000000021627b	addq	$0x10, %r14
000000000021627f	shlq	$0x4, %r8
0000000000216283	movq	%r9, %r15
0000000000216286	subq	%r8, %r15
0000000000216289	shlq	$0x4, -0x30(%rbp)
000000000021628e	shlq	$0x4, %r11
0000000000216292	shlq	$0x4, %rax
0000000000216296	xorl	%r12d, %r12d
0000000000216299	nopl	(%rax)
00000000002162a0	xorl	%r13d, %r13d
00000000002162a3	nopw	%cs:(%rax,%rax)
00000000002162b0	movaps	(%rsi,%r13), %xmm0
00000000002162b5	movaps	0x10(%rsi,%r13), %xmm2
00000000002162bb	shufps	$0xff, %xmm0, %xmm0             ## xmm0 = xmm0[3,3,3,3]
00000000002162bf	movaps	(%r14,%r13), %xmm3
00000000002162c4	movaps	%xmm3, %xmm1
00000000002162c7	shufps	$0x33, %xmm2, %xmm1             ## xmm1 = xmm1[3,0],xmm2[3,0]
00000000002162cb	shufps	$0xf2, -0x10(%r14,%r13), %xmm1  ## xmm1 = xmm1[2,0],mem[3,3]
00000000002162d2	shufps	$0xff, %xmm2, %xmm2             ## xmm2 = xmm2[3,3,3,3]
00000000002162d6	movaps	%xmm1, %xmm4
00000000002162d9	cmpleps	%xmm2, %xmm4
00000000002162dd	movq	0x198(%rbx), %rdx
00000000002162e4	movaps	(%rdx), %xmm5
00000000002162e7	movaps	0x20(%rdx), %xmm2
00000000002162eb	andps	%xmm5, %xmm4
00000000002162ee	shufps	$0xff, %xmm3, %xmm3             ## xmm3 = xmm3[3,3,3,3]
00000000002162f2	movaps	%xmm1, %xmm6
00000000002162f5	cmpleps	%xmm3, %xmm6
00000000002162f9	andps	%xmm5, %xmm6
00000000002162fc	pshufd	$0xaa, %xmm4, %xmm3             ## xmm3 = xmm4[2,2,2,2]
0000000000216301	pshufd	$0x55, %xmm4, %xmm4             ## xmm4 = xmm4[1,1,1,1]
0000000000216306	minps	%xmm4, %xmm3
0000000000216309	pshufd	$0xaa, %xmm6, %xmm4             ## xmm4 = xmm6[2,2,2,2]
000000000021630e	pshufd	$0x0, %xmm6, %xmm6              ## xmm6 = xmm6[0,0,0,0]
0000000000216313	minps	%xmm6, %xmm4
0000000000216316	subps	%xmm4, %xmm2
0000000000216319	mulps	%xmm3, %xmm2
000000000021631c	addps	%xmm4, %xmm2
000000000021631f	movaps	%xmm3, %xmm4
0000000000216322	maxps	%xmm2, %xmm4
0000000000216325	subps	%xmm4, %xmm5
0000000000216328	unpcklps	%xmm3, %xmm2                    ## xmm2 = xmm2[0],xmm3[0],xmm2[1],xmm3[1]
000000000021632b	shufps	$0xe9, %xmm5, %xmm2             ## xmm2 = xmm2[1,2],xmm5[2,3]
000000000021632f	dpps	$0x7f, %xmm1, %xmm2
0000000000216335	maxss	%xmm2, %xmm0
0000000000216339	movsd	0x8(%r15,%r13), %xmm1
0000000000216340	movddup	%xmm1, %xmm2                    ## xmm2 = xmm1[0,0]
0000000000216344	movaps	%xmm0, %xmm3
0000000000216347	maxss	%xmm2, %xmm3
000000000021634b	addps	%xmm0, %xmm1
000000000021634e	movaps	(%r9,%r13), %xmm2
0000000000216353	movsd	0x8(%r9,%r13), %xmm4
000000000021635a	movddup	%xmm4, %xmm5                    ## xmm5 = xmm4[0,0]
000000000021635e	maxss	%xmm5, %xmm3
0000000000216362	addps	%xmm4, %xmm1
0000000000216365	movaps	%xmm2, %xmm4
0000000000216368	shufps	$0xff, %xmm2, %xmm4             ## xmm4 = xmm4[3,3],xmm2[3,3]
000000000021636c	maxss	%xmm4, %xmm3
0000000000216370	unpcklps	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0],xmm3[1],xmm1[1]
0000000000216373	movlhps	%xmm0, %xmm3                    ## xmm3 = xmm3[0],xmm0[0]
0000000000216376	insertps	$0xb0, %xmm2, %xmm3             ## xmm3 = xmm3[0,1,2],xmm2[2]
000000000021637c	movaps	%xmm3, (%r10,%r13)
0000000000216381	addq	$0x10, %r13
0000000000216385	cmpq	%r13, %rax
0000000000216388	jne	0x2162b0
000000000021638e	incl	%r12d
0000000000216391	addq	%rdi, %r14
0000000000216394	addq	%r8, %r15
0000000000216397	addq	-0x30(%rbp), %rsi
000000000021639b	addq	%r8, %r9
000000000021639e	addq	%r11, %r10
00000000002163a1	cmpl	%ecx, %r12d
00000000002163a4	jne	0x2162a0
00000000002163aa	jmp	0x216218
00000000002163af	testl	%ecx, %ecx
00000000002163b1	jle	0x216218
00000000002163b7	testl	%r15d, %r15d
00000000002163ba	jle	0x216218
00000000002163c0	movl	%r15d, %eax
00000000002163c3	shlq	$0x4, %rdi
00000000002163c7	leaq	(%rdi,%r12), %r14
00000000002163cb	addq	$0x10, %r14
00000000002163cf	shlq	$0x4, %r8
00000000002163d3	movq	%r9, %r15
00000000002163d6	subq	%r8, %r15
00000000002163d9	shlq	$0x4, -0x30(%rbp)
00000000002163de	shlq	$0x4, %r11
00000000002163e2	shlq	$0x4, %rax
00000000002163e6	xorl	%r12d, %r12d
00000000002163e9	nopl	(%rax)
00000000002163f0	xorl	%r13d, %r13d
00000000002163f3	nopw	%cs:(%rax,%rax)
0000000000216400	movaps	(%rsi,%r13), %xmm0
0000000000216405	movaps	0x10(%rsi,%r13), %xmm1
000000000021640b	shufps	$0xff, %xmm0, %xmm0             ## xmm0 = xmm0[3,3,3,3]
000000000021640f	movaps	(%r14,%r13), %xmm4
0000000000216414	movaps	%xmm4, %xmm2
0000000000216417	shufps	$0x33, %xmm1, %xmm2             ## xmm2 = xmm2[3,0],xmm1[3,0]
000000000021641b	shufps	$0xf2, -0x10(%r14,%r13), %xmm2  ## xmm2 = xmm2[2,0],mem[3,3]
0000000000216422	shufps	$0xff, %xmm1, %xmm1             ## xmm1 = xmm1[3,3,3,3]
0000000000216426	movaps	%xmm2, %xmm5
0000000000216429	cmpleps	%xmm1, %xmm5
000000000021642d	movq	0x198(%rbx), %rdx
0000000000216434	movaps	(%rdx), %xmm6
0000000000216437	movaps	0x20(%rdx), %xmm3
000000000021643b	movaps	0x40(%rdx), %xmm1
000000000021643f	andps	%xmm6, %xmm5
0000000000216442	shufps	$0xff, %xmm4, %xmm4             ## xmm4 = xmm4[3,3,3,3]
0000000000216446	movaps	%xmm2, %xmm7
0000000000216449	cmpleps	%xmm4, %xmm7
000000000021644d	andps	%xmm6, %xmm7
0000000000216450	pshufd	$0xaa, %xmm5, %xmm4             ## xmm4 = xmm5[2,2,2,2]
0000000000216455	pshufd	$0x55, %xmm5, %xmm5             ## xmm5 = xmm5[1,1,1,1]
000000000021645a	minps	%xmm5, %xmm4
000000000021645d	pshufd	$0xaa, %xmm7, %xmm5             ## xmm5 = xmm7[2,2,2,2]
0000000000216462	pshufd	$0x0, %xmm7, %xmm7              ## xmm7 = xmm7[0,0,0,0]
0000000000216467	minps	%xmm7, %xmm5
000000000021646a	subps	%xmm5, %xmm3
000000000021646d	mulps	%xmm4, %xmm3
0000000000216470	addps	%xmm5, %xmm3
0000000000216473	movaps	%xmm4, %xmm5
0000000000216476	maxps	%xmm3, %xmm5
0000000000216479	subps	%xmm5, %xmm6
000000000021647c	unpcklps	%xmm4, %xmm3                    ## xmm3 = xmm3[0],xmm4[0],xmm3[1],xmm4[1]
000000000021647f	shufps	$0xa9, %xmm6, %xmm3             ## xmm3 = xmm3[1,2],xmm6[2,2]
0000000000216483	mulps	%xmm2, %xmm3
0000000000216486	movshdup	%xmm3, %xmm2                    ## xmm2 = xmm3[1,1,3,3]
000000000021648a	addps	%xmm3, %xmm2
000000000021648d	movhlps	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
0000000000216490	addps	%xmm2, %xmm3
0000000000216493	maxss	%xmm3, %xmm0
0000000000216497	movsd	0x8(%r15,%r13), %xmm2
000000000021649e	movddup	%xmm2, %xmm3                    ## xmm3 = xmm2[0,0]
00000000002164a2	movaps	%xmm0, %xmm4
00000000002164a5	maxss	%xmm3, %xmm4
00000000002164a9	addps	%xmm0, %xmm2
00000000002164ac	movaps	(%r9,%r13), %xmm3
00000000002164b1	movsd	0x8(%r9,%r13), %xmm5
00000000002164b8	movddup	%xmm5, %xmm6                    ## xmm6 = xmm5[0,0]
00000000002164bc	maxss	%xmm6, %xmm4
00000000002164c0	addps	%xmm5, %xmm2
00000000002164c3	movsldup	%xmm3, %xmm5                    ## xmm5 = xmm3[0,0,2,2]
00000000002164c7	shufps	$0xff, %xmm3, %xmm3             ## xmm3 = xmm3[3,3,3,3]
00000000002164cb	maxss	%xmm3, %xmm4
00000000002164cf	unpcklps	%xmm2, %xmm4                    ## xmm4 = xmm4[0],xmm2[0],xmm4[1],xmm2[1]
00000000002164d2	movlhps	%xmm0, %xmm4                    ## xmm4 = xmm4[0],xmm0[0]
00000000002164d5	andps	%xmm1, %xmm5
00000000002164d8	andnps	%xmm4, %xmm1
00000000002164db	orps	%xmm5, %xmm1
00000000002164de	movaps	%xmm1, (%r10,%r13)
00000000002164e3	addq	$0x10, %r13
00000000002164e7	cmpq	%r13, %rax
00000000002164ea	jne	0x216400
00000000002164f0	incl	%r12d
00000000002164f3	addq	%rdi, %r14
00000000002164f6	addq	%r8, %r15
00000000002164f9	addq	-0x30(%rbp), %rsi
00000000002164fd	addq	%r8, %r9
0000000000216500	addq	%r11, %r10
0000000000216503	cmpl	%ecx, %r12d
0000000000216506	jne	0x2163f0
000000000021650c	jmp	0x216218
0000000000216511	nopw	%cs:(%rax,%rax)
