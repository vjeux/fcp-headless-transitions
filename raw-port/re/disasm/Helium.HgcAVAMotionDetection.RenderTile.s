__ZN21HgcAVAMotionDetection10RenderTileEP6HGTile:
0000000000213d40	pushq	%rbp
0000000000213d41	movq	%rsp, %rbp
0000000000213d44	pushq	%r15
0000000000213d46	pushq	%r14
0000000000213d48	pushq	%rbx
0000000000213d49	pushq	%rax
0000000000213d4a	movq	%rsi, %r14
0000000000213d4d	movq	%rdi, %rbx
0000000000213d50	movq	%rsi, %rdi
0000000000213d53	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
0000000000213d58	movq	%rax, %rdi
0000000000213d5b	xorl	%esi, %esi
0000000000213d5d	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
0000000000213d62	cmpl	$0x4700000, %eax                ## imm = 0x4700000
0000000000213d67	jb	0x213d81
0000000000213d69	movq	%rbx, %rdi
0000000000213d6c	movq	%r14, %rsi
0000000000213d6f	callq	__ZN21HgcAVAMotionDetection14RenderTile_AVXEP6HGTile ## HgcAVAMotionDetection::RenderTile_AVX(HGTile*)
0000000000213d74	xorl	%eax, %eax
0000000000213d76	addq	$0x8, %rsp
0000000000213d7a	popq	%rbx
0000000000213d7b	popq	%r14
0000000000213d7d	popq	%r15
0000000000213d7f	popq	%rbp
0000000000213d80	retq
0000000000213d81	movl	0x8(%r14), %r11d
0000000000213d85	movl	0xc(%r14), %ecx
0000000000213d89	subl	(%r14), %r11d
0000000000213d8c	subl	0x4(%r14), %ecx
0000000000213d90	movslq	0x58(%r14), %rdx
0000000000213d94	movq	0x50(%r14), %rsi
0000000000213d98	movslq	0x68(%r14), %rdi
0000000000213d9c	movq	0x60(%r14), %r8
0000000000213da0	movq	0x10(%r14), %r9
0000000000213da4	movslq	0x18(%r14), %r10
0000000000213da8	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
0000000000213dad	jbe	0x213e82
0000000000213db3	testl	%ecx, %ecx
0000000000213db5	jle	0x213d74
0000000000213db7	testl	%r11d, %r11d
0000000000213dba	jle	0x213d74
0000000000213dbc	movl	%r11d, %eax
0000000000213dbf	shlq	$0x4, %rdx
0000000000213dc3	shlq	$0x4, %rdi
0000000000213dc7	shlq	$0x4, %r10
0000000000213dcb	shlq	$0x4, %rax
0000000000213dcf	xorl	%r11d, %r11d
0000000000213dd2	nopw	%cs:(%rax,%rax)
0000000000213de0	xorl	%r14d, %r14d
0000000000213de3	nopw	%cs:(%rax,%rax)
0000000000213df0	movaps	-0x20(%rsi,%r14), %xmm0
0000000000213df6	movaps	-0x20(%r8,%r14), %xmm1
0000000000213dfc	unpcklps	-0x10(%rsi,%r14), %xmm0         ## xmm0 = xmm0[0],mem[0],xmm0[1],mem[1]
0000000000213e02	unpcklpd	0x10(%rsi,%r14), %xmm0          ## xmm0 = xmm0[0],mem[0]
0000000000213e09	insertps	$0x30, 0x20(%rsi,%r14), %xmm0   ## xmm0 = xmm0[0,1,2],mem[0]
0000000000213e12	unpcklps	-0x10(%r8,%r14), %xmm1          ## xmm1 = xmm1[0],mem[0],xmm1[1],mem[1]
0000000000213e18	unpcklpd	0x10(%r8,%r14), %xmm1           ## xmm1 = xmm1[0],mem[0]
0000000000213e1f	insertps	$0x30, 0x20(%r8,%r14), %xmm1    ## xmm1 = xmm1[0,1,2],mem[0]
0000000000213e28	subps	%xmm1, %xmm0
0000000000213e2b	movq	0x198(%rbx), %r15
0000000000213e32	movaps	(%r15), %xmm1
0000000000213e36	andps	%xmm1, %xmm0
0000000000213e39	dpps	$0xff, 0x40(%r15), %xmm0
0000000000213e41	movaps	(%rsi,%r14), %xmm2
0000000000213e46	subps	(%r8,%r14), %xmm2
0000000000213e4b	shufps	$0x0, %xmm2, %xmm2              ## xmm2 = xmm2[0,0,0,0]
0000000000213e4f	andps	%xmm1, %xmm2
0000000000213e52	addps	%xmm0, %xmm2
0000000000213e55	mulps	0x20(%r15), %xmm2
0000000000213e5a	movaps	%xmm2, (%r9,%r14)
0000000000213e5f	addq	$0x10, %r14
0000000000213e63	cmpq	%r14, %rax
0000000000213e66	jne	0x213df0
0000000000213e68	incl	%r11d
0000000000213e6b	addq	%rdx, %rsi
0000000000213e6e	addq	%rdi, %r8
0000000000213e71	addq	%r10, %r9
0000000000213e74	cmpl	%ecx, %r11d
0000000000213e77	jne	0x213de0
0000000000213e7d	jmp	0x213d74
0000000000213e82	testl	%ecx, %ecx
0000000000213e84	jle	0x213d74
0000000000213e8a	testl	%r11d, %r11d
0000000000213e8d	jle	0x213d74
0000000000213e93	movl	%r11d, %eax
0000000000213e96	shlq	$0x4, %rdx
0000000000213e9a	shlq	$0x4, %rdi
0000000000213e9e	shlq	$0x4, %r10
0000000000213ea2	shlq	$0x4, %rax
0000000000213ea6	xorl	%r11d, %r11d
0000000000213ea9	nopl	(%rax)
0000000000213eb0	xorl	%r14d, %r14d
0000000000213eb3	nopw	%cs:(%rax,%rax)
0000000000213ec0	movaps	-0x20(%r8,%r14), %xmm1
0000000000213ec6	movaps	-0x20(%rsi,%r14), %xmm2
0000000000213ecc	movaps	(%rsi,%r14), %xmm0
0000000000213ed1	movaps	0x10(%rsi,%r14), %xmm3
0000000000213ed7	movaps	0x20(%rsi,%r14), %xmm4
0000000000213edd	unpcklps	-0x10(%rsi,%r14), %xmm2         ## xmm2 = xmm2[0],mem[0],xmm2[1],mem[1]
0000000000213ee3	unpcklps	-0x10(%r8,%r14), %xmm1          ## xmm1 = xmm1[0],mem[0],xmm1[1],mem[1]
0000000000213ee9	subps	%xmm1, %xmm2
0000000000213eec	movaps	%xmm3, %xmm1
0000000000213eef	subps	0x10(%r8,%r14), %xmm1
0000000000213ef5	blendps	$0x2, %xmm3, %xmm1              ## xmm1 = xmm1[0],xmm3[1],xmm1[2,3]
0000000000213efb	movlhps	%xmm1, %xmm2                    ## xmm2 = xmm2[0],xmm1[0]
0000000000213efe	subps	0x20(%r8,%r14), %xmm4
0000000000213f04	movq	0x198(%rbx), %r15
0000000000213f0b	movaps	(%r15), %xmm1
0000000000213f0f	movaps	0x60(%r15), %xmm3
0000000000213f14	shufps	$0x0, %xmm4, %xmm4              ## xmm4 = xmm4[0,0,0,0]
0000000000213f18	andps	%xmm3, %xmm4
0000000000213f1b	andnps	%xmm2, %xmm3
0000000000213f1e	orps	%xmm4, %xmm3
0000000000213f21	andps	%xmm1, %xmm3
0000000000213f24	pshufd	$0x39, %xmm3, %xmm2             ## xmm2 = xmm3[1,2,3,0]
0000000000213f29	addps	%xmm3, %xmm2
0000000000213f2c	movaps	%xmm2, %xmm3
0000000000213f2f	shufps	$0x4e, %xmm2, %xmm3             ## xmm3 = xmm3[2,3],xmm2[0,1]
0000000000213f33	addps	%xmm2, %xmm3
0000000000213f36	subps	(%r8,%r14), %xmm0
0000000000213f3b	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
0000000000213f3f	andps	%xmm1, %xmm0
0000000000213f42	addps	%xmm3, %xmm0
0000000000213f45	mulps	0x20(%r15), %xmm0
0000000000213f4a	movaps	%xmm0, (%r9,%r14)
0000000000213f4f	addq	$0x10, %r14
0000000000213f53	cmpq	%r14, %rax
0000000000213f56	jne	0x213ec0
0000000000213f5c	incl	%r11d
0000000000213f5f	addq	%rdx, %rsi
0000000000213f62	addq	%rdi, %r8
0000000000213f65	addq	%r10, %r9
0000000000213f68	cmpl	%ecx, %r11d
0000000000213f6b	jne	0x213eb0
0000000000213f71	jmp	0x213d74
0000000000213f76	nopw	%cs:(%rax,%rax)
