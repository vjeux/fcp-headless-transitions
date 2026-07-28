__ZN10HgcSampler4InitEPNS_5StateEPK11HGTransformi:
00000000002d3470	pushq	%rbp
00000000002d3471	movq	%rsp, %rbp
00000000002d3474	pushq	%r14
00000000002d3476	pushq	%rbx
00000000002d3477	subq	$0x90, %rsp
00000000002d347e	movl	%edx, %ebx
00000000002d3480	movq	%rsi, %rax
00000000002d3483	movq	%rdi, %r14
00000000002d3486	movq	0x72edcb(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000002d348d	movq	(%rcx), %rcx
00000000002d3490	movq	%rcx, -0x18(%rbp)
00000000002d3494	movq	(%rsi), %rcx
00000000002d3497	leaq	-0xa0(%rbp), %rsi
00000000002d349e	movq	%rax, %rdi
00000000002d34a1	callq	*0x30(%rcx)
00000000002d34a4	cvtpd2ps	-0x90(%rbp), %xmm0
00000000002d34ac	cvtpd2ps	-0xa0(%rbp), %xmm1
00000000002d34b4	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000002d34b8	movupd	%xmm1, (%r14)
00000000002d34bd	movupd	%xmm1, 0x10(%r14)
00000000002d34c3	cvtpd2ps	-0x70(%rbp), %xmm0
00000000002d34c8	cvtpd2ps	-0x80(%rbp), %xmm1
00000000002d34cd	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000002d34d1	movupd	%xmm1, 0x20(%r14)
00000000002d34d7	movupd	%xmm1, 0x30(%r14)
00000000002d34dd	cvtpd2ps	-0x50(%rbp), %xmm0
00000000002d34e2	cvtpd2ps	-0x60(%rbp), %xmm1
00000000002d34e7	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000002d34eb	movupd	%xmm1, 0x40(%r14)
00000000002d34f1	movupd	%xmm1, 0x50(%r14)
00000000002d34f7	cvtpd2ps	-0x30(%rbp), %xmm0
00000000002d34fc	cvtpd2ps	-0x40(%rbp), %xmm1
00000000002d3501	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000002d3505	movupd	%xmm1, 0x60(%r14)
00000000002d350b	movupd	%xmm1, 0x70(%r14)
00000000002d3511	callq	__Z15HGGetHostTargetv           ## HGGetHostTarget()
00000000002d3516	movss	0xc(%r14), %xmm1
00000000002d351c	xorpd	%xmm0, %xmm0
00000000002d3520	ucomiss	%xmm0, %xmm1
00000000002d3523	jne	0x2d356c
00000000002d3525	jp	0x2d356c
00000000002d3527	movss	0x2c(%r14), %xmm1
00000000002d352d	ucomiss	%xmm0, %xmm1
00000000002d3530	jne	0x2d356c
00000000002d3532	jp	0x2d356c
00000000002d3534	movss	0x4c(%r14), %xmm0
00000000002d353a	xorps	%xmm1, %xmm1
00000000002d353d	ucomiss	%xmm1, %xmm0
00000000002d3540	jne	0x2d356c
00000000002d3542	jp	0x2d356c
00000000002d3544	movss	0x6c(%r14), %xmm0
00000000002d354a	ucomiss	0xf476f(%rip), %xmm0
00000000002d3551	jne	0x2d356c
00000000002d3553	jp	0x2d356c
00000000002d3555	testl	%ebx, %ebx
00000000002d3557	jle	0x2d35ba
00000000002d3559	cmpl	$0x46fffff, %eax                ## imm = 0x46FFFFF
00000000002d355e	jbe	0x2d35ca
00000000002d3560	leaq	__ZL23GetAffineLinearTile_AVXP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetAffineLinearTile_AVX(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d3567	jmp	0x2d35f6
00000000002d356c	testl	%ebx, %ebx
00000000002d356e	jle	0x2d3580
00000000002d3570	cmpl	$0x46fffff, %eax                ## imm = 0x46FFFFF
00000000002d3575	jbe	0x2d3590
00000000002d3577	leaq	__ZL22GetPerspLinearTile_AVXP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetPerspLinearTile_AVX(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d357e	jmp	0x2d35f6
00000000002d3580	cmpl	$0x46fffff, %eax                ## imm = 0x46FFFFF
00000000002d3585	jbe	0x2d35a5
00000000002d3587	leaq	__ZL23GetPerspNearestTile_AVXP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetPerspNearestTile_AVX(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d358e	jmp	0x2d35f6
00000000002d3590	cmpl	$0x4500000, %eax                ## imm = 0x4500000
00000000002d3595	leaq	__ZL23GetPerspLinearTile_SSE4P6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rcx ## GetPerspLinearTile_SSE4(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d359c	leaq	__ZL18GetPerspLinearTileP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetPerspLinearTile(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35a3	jmp	0x2d35f2
00000000002d35a5	cmpl	$0x4500000, %eax                ## imm = 0x4500000
00000000002d35aa	leaq	__ZL24GetPerspNearestTile_SSE4P6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rcx ## GetPerspNearestTile_SSE4(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35b1	leaq	__ZL19GetPerspNearestTileP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetPerspNearestTile(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35b8	jmp	0x2d35f2
00000000002d35ba	cmpl	$0x46fffff, %eax                ## imm = 0x46FFFFF
00000000002d35bf	jbe	0x2d35df
00000000002d35c1	leaq	__ZL24GetAffineNearestTile_AVXP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetAffineNearestTile_AVX(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35c8	jmp	0x2d35f6
00000000002d35ca	cmpl	$0x4500000, %eax                ## imm = 0x4500000
00000000002d35cf	leaq	__ZL24GetAffineLinearTile_SSE4P6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rcx ## GetAffineLinearTile_SSE4(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35d6	leaq	__ZL19GetAffineLinearTileP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetAffineLinearTile(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35dd	jmp	0x2d35f2
00000000002d35df	cmpl	$0x4500000, %eax                ## imm = 0x4500000
00000000002d35e4	leaq	__ZL25GetAffineNearestTile_SSE4P6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rcx ## GetAffineNearestTile_SSE4(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35eb	leaq	__ZL20GetAffineNearestTileP6HGTilePKN10HgcSampler5StateEP6HGNode(%rip), %rax ## GetAffineNearestTile(HGTile*, HgcSampler::State const*, HGNode*)
00000000002d35f2	cmovaeq	%rcx, %rax
00000000002d35f6	movq	0x72ec5b(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000002d35fd	movq	(%rcx), %rcx
00000000002d3600	cmpq	-0x18(%rbp), %rcx
00000000002d3604	jne	0x2d3612
00000000002d3606	addq	$0x90, %rsp
00000000002d360d	popq	%rbx
00000000002d360e	popq	%r14
00000000002d3610	popq	%rbp
00000000002d3611	retq
00000000002d3612	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000002d3617	nopw	(%rax,%rax)
