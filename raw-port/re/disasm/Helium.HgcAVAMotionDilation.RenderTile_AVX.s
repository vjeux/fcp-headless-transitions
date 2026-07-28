__ZN20HgcAVAMotionDilation14RenderTile_AVXEP6HGTile:
0000000000215ea0	pushq	%rbp
0000000000215ea1	movq	%rsp, %rbp
0000000000215ea4	pushq	%r15
0000000000215ea6	pushq	%r14
0000000000215ea8	pushq	%r13
0000000000215eaa	pushq	%r12
0000000000215eac	pushq	%rbx
0000000000215ead	movl	0xc(%rsi), %eax
0000000000215eb0	subl	0x4(%rsi), %eax
0000000000215eb3	movl	%eax, -0x34(%rbp)
0000000000215eb6	jle	0x2161c3
0000000000215ebc	movl	0x8(%rsi), %ecx
0000000000215ebf	subl	(%rsi), %ecx
0000000000215ec1	movslq	0x68(%rsi), %rax
0000000000215ec5	movslq	0x78(%rsi), %r13
0000000000215ec9	movslq	0x18(%rsi), %r8
0000000000215ecd	movq	0x10(%rsi), %r9
0000000000215ed1	movq	0x50(%rsi), %r11
0000000000215ed5	movq	0x70(%rsi), %rbx
0000000000215ed9	movq	0x60(%rsi), %r14
0000000000215edd	movslq	0x58(%rsi), %rsi
0000000000215ee1	movq	%rax, -0x58(%rbp)
0000000000215ee5	shlq	$0x4, %rax
0000000000215ee9	movq	%rax, -0x78(%rbp)
0000000000215eed	leaq	(%rax,%r14), %r10
0000000000215ef1	addq	$0x20, %r10
0000000000215ef5	shlq	$0x4, %r8
0000000000215ef9	movq	%r8, -0x88(%rbp)
0000000000215f00	movq	%r13, -0x50(%rbp)
0000000000215f04	shlq	$0x4, %r13
0000000000215f08	shlq	$0x4, %rsi
0000000000215f0c	movq	%rsi, -0x80(%rbp)
0000000000215f10	movq	%r13, -0x70(%rbp)
0000000000215f14	negq	%r13
0000000000215f17	leaq	0x10(%r9), %r12
0000000000215f1b	leaq	0x10(%rbx), %rax
0000000000215f1f	movq	%rax, -0x40(%rbp)
0000000000215f23	leaq	0x20(%r11), %rax
0000000000215f27	movq	%rax, -0x48(%rbp)
0000000000215f2b	xorl	%esi, %esi
0000000000215f2d	jmp	0x215f68
0000000000215f2f	nop
0000000000215f30	movq	-0x80(%rbp), %rax
0000000000215f34	addq	%rax, %r11
0000000000215f37	movq	-0x78(%rbp), %rdx
0000000000215f3b	addq	%rdx, %r14
0000000000215f3e	movq	-0x70(%rbp), %r15
0000000000215f42	addq	%r15, %rbx
0000000000215f45	movq	-0x88(%rbp), %r8
0000000000215f4c	addq	%r8, %r9
0000000000215f4f	incl	%esi
0000000000215f51	addq	%rdx, %r10
0000000000215f54	addq	%r8, %r12
0000000000215f57	addq	%r15, -0x40(%rbp)
0000000000215f5b	addq	%rax, -0x48(%rbp)
0000000000215f5f	cmpl	-0x34(%rbp), %esi
0000000000215f62	je	0x2161c3
0000000000215f68	movl	%esi, -0x38(%rbp)
0000000000215f6b	movl	$0x0, %r15d
0000000000215f71	cmpl	$0x2, %ecx
0000000000215f74	jl	0x2160a9
0000000000215f7a	movq	%r9, -0x30(%rbp)
0000000000215f7e	xorl	%r15d, %r15d
0000000000215f81	movq	-0x48(%rbp), %r9
0000000000215f85	movq	-0x40(%rbp), %rax
0000000000215f89	movq	%r12, -0x60(%rbp)
0000000000215f8d	movq	%r12, %rdx
0000000000215f90	movq	%r10, -0x68(%rbp)
0000000000215f94	movq	%r10, %r12
0000000000215f97	nopw	(%rax,%rax)
0000000000215fa0	vpermilps	$0xff, -0x10(%r9), %ymm0 ## ymm0 = mem[3,3,3,3,7,7,7,7]
0000000000215fa7	vmovupd	-0x10(%r12), %ymm1
0000000000215fae	vshufpd	$0x5, %ymm1, %ymm1, %ymm2       ## ymm2 = ymm1[1,0,3,2]
0000000000215fb3	vblendps	$0x22, %ymm2, %ymm0, %ymm2      ## ymm2 = ymm0[0],ymm2[1],ymm0[2,3,4],ymm2[5],ymm0[6,7]
0000000000215fb9	vshufps	$0xf4, -0x20(%r12), %ymm2, %ymm2 ## ymm2 = ymm2[0,1],mem[3,3],ymm2[4,5],mem[7,7]
0000000000215fc1	vcmpleps	%ymm0, %ymm2, %ymm0
0000000000215fc6	movq	0x198(%rdi), %r10
0000000000215fcd	vmovups	(%r10), %ymm3
0000000000215fd2	vmovups	0x20(%r10), %ymm4
0000000000215fd8	vandps	%ymm3, %ymm0, %ymm0
0000000000215fdc	vshufps	$0xff, %ymm1, %ymm1, %ymm1      ## ymm1 = ymm1[3,3,3,3,7,7,7,7]
0000000000215fe1	vcmpleps	%ymm1, %ymm2, %ymm1
0000000000215fe6	vandps	%ymm3, %ymm1, %ymm1
0000000000215fea	vshufps	$0xaa, %ymm0, %ymm0, %ymm5      ## ymm5 = ymm0[2,2,2,2,6,6,6,6]
0000000000215fef	vshufps	$0x55, %ymm0, %ymm0, %ymm0      ## ymm0 = ymm0[1,1,1,1,5,5,5,5]
0000000000215ff4	vshufps	$0xaa, %ymm1, %ymm1, %ymm6      ## ymm6 = ymm1[2,2,2,2,6,6,6,6]
0000000000215ff9	vshufps	$0x0, %ymm1, %ymm1, %ymm1       ## ymm1 = ymm1[0,0,0,0,4,4,4,4]
0000000000215ffe	vminps	%ymm0, %ymm5, %ymm0
0000000000216002	vminps	%ymm1, %ymm6, %ymm1
0000000000216006	vsubps	%ymm1, %ymm4, %ymm4
000000000021600a	vmulps	%ymm4, %ymm0, %ymm4
000000000021600e	vaddps	%ymm4, %ymm1, %ymm1
0000000000216012	vmaxps	%ymm1, %ymm0, %ymm4
0000000000216016	vsubps	%ymm4, %ymm3, %ymm3
000000000021601a	vunpcklps	%ymm0, %ymm1, %ymm0     ## ymm0 = ymm1[0],ymm0[0],ymm1[1],ymm0[1],ymm1[4],ymm0[4],ymm1[5],ymm0[5]
000000000021601e	vshufps	$0xe9, %ymm3, %ymm0, %ymm0      ## ymm0 = ymm0[1,2],ymm3[2,3],ymm0[5,6],ymm3[6,7]
0000000000216023	vdpps	$0x7f, %ymm2, %ymm0, %ymm0
0000000000216029	vpermilps	$0xff, -0x20(%r9), %ymm1 ## ymm1 = mem[3,3,3,3,7,7,7,7]
0000000000216030	vpermilps	$0xaa, -0x10(%rax,%r13), %ymm2 ## ymm2 = mem[2,2,2,2,6,6,6,6]
0000000000216038	vmaxps	%ymm0, %ymm1, %ymm0
000000000021603c	vmaxps	%ymm2, %ymm0, %ymm1
0000000000216040	vmovups	-0x10(%rax), %ymm3
0000000000216045	vshufps	$0xaa, %ymm3, %ymm3, %ymm4      ## ymm4 = ymm3[2,2,2,2,6,6,6,6]
000000000021604a	vaddps	%ymm2, %ymm0, %ymm2
000000000021604e	vmaxps	%ymm4, %ymm1, %ymm1
0000000000216052	vaddps	%ymm4, %ymm2, %ymm2
0000000000216056	vshufps	$0xff, %ymm3, %ymm3, %ymm4      ## ymm4 = ymm3[3,3,3,3,7,7,7,7]
000000000021605b	vmaxps	%ymm4, %ymm1, %ymm1
000000000021605f	vunpcklps	%ymm2, %ymm1, %ymm1     ## ymm1 = ymm1[0],ymm2[0],ymm1[1],ymm2[1],ymm1[4],ymm2[4],ymm1[5],ymm2[5]
0000000000216063	vshufpd	$0x5, %ymm0, %ymm3, %ymm0       ## ymm0 = ymm3[1],ymm0[0],ymm3[3],ymm0[2]
0000000000216068	vshufps	$0x24, %ymm0, %ymm1, %ymm0      ## ymm0 = ymm1[0,1],ymm0[2,0],ymm1[4,5],ymm0[6,4]
000000000021606d	vmovups	%ymm0, -0x10(%rdx)
0000000000216072	addq	$0x20, %r12
0000000000216076	addq	$0x20, %rax
000000000021607a	addq	$0x20, %r9
000000000021607e	addq	$0x20, %rdx
0000000000216082	movl	%r15d, %r10d
0000000000216085	addl	$-0x2, %r15d
0000000000216089	addl	%ecx, %r10d
000000000021608c	addl	$-0x2, %r10d
0000000000216090	cmpl	$0x1, %r10d
0000000000216094	jg	0x215fa0
000000000021609a	negl	%r15d
000000000021609d	movq	-0x30(%rbp), %r9
00000000002160a1	movq	-0x68(%rbp), %r10
00000000002160a5	movq	-0x60(%rbp), %r12
00000000002160a9	cmpl	%ecx, %r15d
00000000002160ac	movl	-0x38(%rbp), %esi
00000000002160af	jge	0x215f30
00000000002160b5	movl	%r15d, %eax
00000000002160b8	shlq	$0x4, %rax
00000000002160bc	vbroadcastss	0xc(%r11,%rax), %xmm0
00000000002160c3	vmovaps	0x10(%r11,%rax), %xmm1
00000000002160ca	movq	-0x58(%rbp), %rdx
00000000002160ce	addl	%r15d, %edx
00000000002160d1	movslq	%edx, %rdx
00000000002160d4	shlq	$0x4, %rdx
00000000002160d8	vshufps	$0x33, 0x10(%r14,%rdx), %xmm1, %xmm1 ## xmm1 = xmm1[3,0],mem[3,0]
00000000002160e0	vshufps	$0xf8, (%r14,%rdx), %xmm1, %xmm1 ## xmm1 = xmm1[0,2],mem[3,3]
00000000002160e7	vbroadcastss	0x1c(%r11,%rax), %xmm2
00000000002160ee	vcmpleps	%xmm2, %xmm1, %xmm2
00000000002160f3	movq	%r14, -0x30(%rbp)
00000000002160f7	movq	%r12, %r8
00000000002160fa	movq	%r10, %r12
00000000002160fd	movq	%r9, %r10
0000000000216100	movq	0x198(%rdi), %r9
0000000000216107	vmovaps	(%r9), %xmm3
000000000021610c	vmovaps	0x20(%r9), %xmm4
0000000000216112	movq	%r10, %r9
0000000000216115	movq	%r12, %r10
0000000000216118	movq	%r8, %r12
000000000021611b	movq	-0x30(%rbp), %r14
000000000021611f	vandps	%xmm3, %xmm2, %xmm2
0000000000216123	vbroadcastss	0x1c(%r14,%rdx), %xmm5
000000000021612a	vcmpleps	%xmm5, %xmm1, %xmm5
000000000021612f	vandps	%xmm3, %xmm5, %xmm5
0000000000216133	vshufps	$0xaa, %xmm2, %xmm2, %xmm6      ## xmm6 = xmm2[2,2,2,2]
0000000000216138	vshufps	$0x55, %xmm2, %xmm2, %xmm2      ## xmm2 = xmm2[1,1,1,1]
000000000021613d	vminps	%xmm2, %xmm6, %xmm2
0000000000216141	vshufps	$0xaa, %xmm5, %xmm5, %xmm6      ## xmm6 = xmm5[2,2,2,2]
0000000000216146	vshufps	$0x0, %xmm5, %xmm5, %xmm5       ## xmm5 = xmm5[0,0,0,0]
000000000021614b	vminps	%xmm5, %xmm6, %xmm5
000000000021614f	vsubps	%xmm5, %xmm4, %xmm4
0000000000216153	vmulps	%xmm4, %xmm2, %xmm4
0000000000216157	vaddps	%xmm4, %xmm5, %xmm4
000000000021615b	vmaxps	%xmm4, %xmm2, %xmm5
000000000021615f	vsubps	%xmm5, %xmm3, %xmm3
0000000000216163	vunpcklps	%xmm2, %xmm4, %xmm2     ## xmm2 = xmm4[0],xmm2[0],xmm4[1],xmm2[1]
0000000000216167	vshufps	$0xe9, %xmm3, %xmm2, %xmm2      ## xmm2 = xmm2[1,2],xmm3[2,3]
000000000021616c	vdpps	$0x7f, %xmm1, %xmm2, %xmm1
0000000000216172	vmaxps	%xmm1, %xmm0, %xmm0
0000000000216176	subl	-0x50(%rbp), %r15d
000000000021617a	movslq	%r15d, %rdx
000000000021617d	shlq	$0x4, %rdx
0000000000216181	vbroadcastss	0x8(%rbx,%rdx), %xmm1
0000000000216188	vmaxps	%xmm1, %xmm0, %xmm2
000000000021618c	vaddps	%xmm1, %xmm0, %xmm1
0000000000216190	vbroadcastss	0x8(%rbx,%rax), %xmm3
0000000000216197	vmaxps	%xmm3, %xmm2, %xmm2
000000000021619b	vaddps	%xmm3, %xmm1, %xmm1
000000000021619f	vbroadcastss	0xc(%rbx,%rax), %xmm4
00000000002161a6	vmaxps	%xmm4, %xmm2, %xmm2
00000000002161aa	vunpcklps	%xmm1, %xmm2, %xmm1     ## xmm1 = xmm2[0],xmm1[0],xmm2[1],xmm1[1]
00000000002161ae	vmovlhps	%xmm0, %xmm1, %xmm0             ## xmm0 = xmm1[0],xmm0[0]
00000000002161b2	vblendps	$0x8, %xmm3, %xmm0, %xmm0       ## xmm0 = xmm0[0,1,2],xmm3[3]
00000000002161b8	vmovaps	%xmm0, (%r9,%rax)
00000000002161be	jmp	0x215f30
00000000002161c3	vzeroupper
00000000002161c6	xorl	%eax, %eax
00000000002161c8	popq	%rbx
00000000002161c9	popq	%r12
00000000002161cb	popq	%r13
00000000002161cd	popq	%r14
00000000002161cf	popq	%r15
00000000002161d1	popq	%rbp
00000000002161d2	retq
00000000002161d3	nopw	%cs:(%rax,%rax)
