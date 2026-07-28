__ZN21HgcAVAMotionDetection14RenderTile_AVXEP6HGTile:
0000000000213b30	movl	0xc(%rsi), %eax
0000000000213b33	subl	0x4(%rsi), %eax
0000000000213b36	jle	0x213d2d
0000000000213b3c	pushq	%rbp
0000000000213b3d	movq	%rsp, %rbp
0000000000213b40	pushq	%r15
0000000000213b42	pushq	%r14
0000000000213b44	pushq	%r12
0000000000213b46	pushq	%rbx
0000000000213b47	movl	0x8(%rsi), %ecx
0000000000213b4a	subl	(%rsi), %ecx
0000000000213b4c	movslq	0x18(%rsi), %rdx
0000000000213b50	movq	0x10(%rsi), %r8
0000000000213b54	movq	0x50(%rsi), %r9
0000000000213b58	movq	0x60(%rsi), %r10
0000000000213b5c	movslq	0x68(%rsi), %r11
0000000000213b60	movslq	0x58(%rsi), %rsi
0000000000213b64	shlq	$0x4, %r11
0000000000213b68	shlq	$0x4, %rsi
0000000000213b6c	shlq	$0x4, %rdx
0000000000213b70	xorl	%ebx, %ebx
0000000000213b72	jmp	0x213b93
0000000000213b74	nopw	%cs:(%rax,%rax)
0000000000213b80	addq	%rsi, %r9
0000000000213b83	addq	%r11, %r10
0000000000213b86	addq	%rdx, %r8
0000000000213b89	incl	%ebx
0000000000213b8b	cmpl	%eax, %ebx
0000000000213b8d	je	0x213d25
0000000000213b93	movl	$0x0, %r14d
0000000000213b99	cmpl	$0x2, %ecx
0000000000213b9c	jl	0x213c80
0000000000213ba2	movl	$0x10, %r15d
0000000000213ba8	xorl	%r14d, %r14d
0000000000213bab	nopl	(%rax,%rax)
0000000000213bb0	vmovaps	-0x30(%r9,%r15), %xmm0
0000000000213bb7	vmovaps	-0x20(%r9,%r15), %xmm1
0000000000213bbe	vmovaps	-0x10(%r9,%r15), %xmm2
0000000000213bc5	vsubps	-0x30(%r10,%r15), %xmm0, %xmm0
0000000000213bcc	vsubps	-0x20(%r10,%r15), %xmm1, %xmm1
0000000000213bd3	vmovaps	(%r9,%r15), %xmm3
0000000000213bd9	vinsertf128	$0x1, %xmm1, %ymm0, %ymm0
0000000000213bdf	vsubps	-0x10(%r10,%r15), %xmm2, %xmm2
0000000000213be6	vinsertf128	$0x1, %xmm2, %ymm1, %ymm1
0000000000213bec	vunpcklps	%ymm1, %ymm0, %ymm0     ## ymm0 = ymm0[0],ymm1[0],ymm0[1],ymm1[1],ymm0[4],ymm1[4],ymm0[5],ymm1[5]
0000000000213bf0	vsubps	(%r10,%r15), %xmm3, %xmm1
0000000000213bf6	vmovaps	0x10(%r9,%r15), %xmm3
0000000000213bfd	vsubps	0x10(%r10,%r15), %xmm3, %xmm3
0000000000213c04	vinsertf128	$0x1, %xmm3, %ymm1, %ymm4
0000000000213c0a	vmovaps	0x20(%r9,%r15), %xmm5
0000000000213c11	vsubps	0x20(%r10,%r15), %xmm5, %xmm5
0000000000213c18	vinsertf128	$0x1, %xmm5, %ymm3, %ymm3
0000000000213c1e	vunpcklpd	%ymm4, %ymm3, %ymm3     ## ymm3 = ymm3[0],ymm4[0],ymm3[2],ymm4[2]
0000000000213c22	vshufps	$0x24, %ymm3, %ymm0, %ymm0      ## ymm0 = ymm0[0,1],ymm3[2,0],ymm0[4,5],ymm3[6,4]
0000000000213c27	movq	0x198(%rdi), %r12
0000000000213c2e	vmovups	(%r12), %ymm3
0000000000213c34	vandps	%ymm0, %ymm3, %ymm0
0000000000213c38	vhaddps	%ymm0, %ymm0, %ymm0
0000000000213c3c	vhaddps	%ymm0, %ymm0, %ymm0
0000000000213c40	vinsertf128	$0x1, %xmm1, %ymm2, %ymm1
0000000000213c46	vshufps	$0x0, %ymm1, %ymm1, %ymm1       ## ymm1 = ymm1[0,0,0,0,4,4,4,4]
0000000000213c4b	vandps	%ymm1, %ymm3, %ymm1
0000000000213c4f	vaddps	%ymm1, %ymm0, %ymm0
0000000000213c53	vmulps	0x20(%r12), %ymm0, %ymm0
0000000000213c5a	vmovups	%ymm0, -0x10(%r8,%r15)
0000000000213c61	addq	$0x20, %r15
0000000000213c65	movl	%r14d, %r12d
0000000000213c68	addl	$-0x2, %r14d
0000000000213c6c	addl	%ecx, %r12d
0000000000213c6f	addl	$-0x2, %r12d
0000000000213c73	cmpl	$0x1, %r12d
0000000000213c77	jg	0x213bb0
0000000000213c7d	negl	%r14d
0000000000213c80	cmpl	%ecx, %r14d
0000000000213c83	jge	0x213b80
0000000000213c89	movslq	%r14d, %r15
0000000000213c8c	shlq	$0x4, %r15
0000000000213c90	vmovaps	-0x20(%r9,%r15), %xmm0
0000000000213c97	vmovaps	-0x10(%r9,%r15), %xmm1
0000000000213c9e	vsubps	-0x20(%r10,%r15), %xmm0, %xmm0
0000000000213ca5	vsubps	-0x10(%r10,%r15), %xmm1, %xmm1
0000000000213cac	vunpcklps	%xmm1, %xmm0, %xmm0     ## xmm0 = xmm0[0],xmm1[0],xmm0[1],xmm1[1]
0000000000213cb0	movl	%r14d, %r15d
0000000000213cb3	orl	$0x1, %r14d
0000000000213cb7	shlq	$0x4, %r14
0000000000213cbb	vmovaps	(%r9,%r14), %xmm1
0000000000213cc1	vsubps	(%r10,%r14), %xmm1, %xmm1
0000000000213cc7	shlq	$0x4, %r15
0000000000213ccb	vmovss	0x20(%r9,%r15), %xmm2
0000000000213cd2	vsubss	0x20(%r10,%r15), %xmm2, %xmm2
0000000000213cd9	vmovlhps	%xmm1, %xmm0, %xmm0             ## xmm0 = xmm0[0],xmm1[0]
0000000000213cdd	vinsertps	$0x30, %xmm2, %xmm0, %xmm0 ## xmm0 = xmm0[0,1,2],xmm2[0]
0000000000213ce3	movq	0x198(%rdi), %r14
0000000000213cea	vmovaps	(%r14), %xmm1
0000000000213cef	vandps	%xmm0, %xmm1, %xmm0
0000000000213cf3	vhaddps	%xmm0, %xmm0, %xmm0
0000000000213cf7	vmovaps	(%r9,%r15), %xmm2
0000000000213cfd	vhaddps	%xmm0, %xmm0, %xmm0
0000000000213d01	vsubps	(%r10,%r15), %xmm2, %xmm2
0000000000213d07	vshufps	$0x0, %xmm2, %xmm2, %xmm2       ## xmm2 = xmm2[0,0,0,0]
0000000000213d0c	vandps	%xmm1, %xmm2, %xmm1
0000000000213d10	vaddps	%xmm1, %xmm0, %xmm0
0000000000213d14	vmulps	0x20(%r14), %xmm0, %xmm0
0000000000213d1a	vmovaps	%xmm0, (%r8,%r15)
0000000000213d20	jmp	0x213b80
0000000000213d25	popq	%rbx
0000000000213d26	popq	%r12
0000000000213d28	popq	%r14
0000000000213d2a	popq	%r15
0000000000213d2c	popq	%rbp
0000000000213d2d	vzeroupper
0000000000213d30	xorl	%eax, %eax
0000000000213d32	retq
0000000000213d33	nopw	%cs:(%rax,%rax)
