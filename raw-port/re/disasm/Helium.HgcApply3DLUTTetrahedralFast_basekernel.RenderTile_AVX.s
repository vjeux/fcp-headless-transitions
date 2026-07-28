__ZN39HgcApply3DLUTTetrahedralFast_basekernel14RenderTile_AVXEP6HGTile:
000000000038a600	vbroadcastf128	(%rsi), %ymm0           ## ymm0 = mem[0,1,0,1]
000000000038a605	vshufps	$0xee, %xmm0, %xmm0, %xmm1      ## xmm1 = xmm0[2,3,2,3]
000000000038a60a	vpsubd	%xmm0, %xmm1, %xmm1
000000000038a60e	vpextrd	$0x1, %xmm1, %r11d
000000000038a614	testl	%r11d, %r11d
000000000038a617	jle	0x38b18b
000000000038a61d	pushq	%rbp
000000000038a61e	movq	%rsp, %rbp
000000000038a621	pushq	%r15
000000000038a623	pushq	%r14
000000000038a625	pushq	%r13
000000000038a627	pushq	%r12
000000000038a629	pushq	%rbx
000000000038a62a	andq	$-0x20, %rsp
000000000038a62e	subq	$0x160, %rsp                    ## imm = 0x160
000000000038a635	vcvtdq2ps	%ymm0, %ymm0
000000000038a639	vmulps	0x509f9f(%rip), %ymm0, %ymm0
000000000038a641	vaddps	0x509fb7(%rip), %ymm0, %ymm6
000000000038a649	vmovd	%xmm1, %ecx
000000000038a64d	movslq	0x18(%rsi), %rax
000000000038a651	movq	0x10(%rsi), %r8
000000000038a655	movq	0x50(%rsi), %r9
000000000038a659	movslq	0x58(%rsi), %rdx
000000000038a65d	shlq	$0x4, %rax
000000000038a661	movq	%rax, 0x38(%rsp)
000000000038a666	shlq	$0x4, %rdx
000000000038a66a	movq	%rdx, 0x30(%rsp)
000000000038a66f	xorl	%eax, %eax
000000000038a671	vmovaps	0x509fa7(%rip), %ymm14
000000000038a679	vmovaps	%ymm6, 0x40(%rsp)
000000000038a67f	movq	%rcx, 0x8(%rsp)
000000000038a684	movl	%r11d, 0x4(%rsp)
000000000038a689	jmp	0x38a6a5
000000000038a68b	nopl	(%rax,%rax)
000000000038a690	addq	0x30(%rsp), %r9
000000000038a695	addq	0x38(%rsp), %r8
000000000038a69a	incl	%eax
000000000038a69c	cmpl	%r11d, %eax
000000000038a69f	je	0x38b17d
000000000038a6a5	movl	$0x0, %ebx
000000000038a6aa	cmpl	$0x2, %ecx
000000000038a6ad	movl	%eax, (%rsp)
000000000038a6b0	jl	0x38aca4
000000000038a6b6	movl	$0x10, %r14d
000000000038a6bc	xorl	%ebx, %ebx
000000000038a6be	nop
000000000038a6c0	vmovups	-0x10(%r9,%r14), %ymm1
000000000038a6c7	vmovaps	%ymm1, 0x120(%rsp)
000000000038a6d0	movq	0x198(%rdi), %r15
000000000038a6d7	vbroadcastss	(%r15), %ymm0
000000000038a6dc	vmulps	%ymm0, %ymm1, %ymm0
000000000038a6e0	vbroadcastss	0x4(%r15), %ymm1
000000000038a6e6	vbroadcastss	0x64(%r15), %ymm2
000000000038a6ec	vaddps	%ymm1, %ymm0, %ymm0
000000000038a6f0	vbroadcastss	0x60(%r15), %ymm1
000000000038a6f6	vmulps	%ymm0, %ymm0, %ymm3
000000000038a6fa	vmulps	%ymm2, %ymm0, %ymm2
000000000038a6fe	vbroadcastss	0x68(%r15), %ymm4
000000000038a704	vmulps	%ymm3, %ymm0, %ymm0
000000000038a708	vmulps	%ymm4, %ymm3, %ymm3
000000000038a70c	vbroadcastss	0x6c(%r15), %ymm4
000000000038a712	vaddps	%ymm1, %ymm2, %ymm1
000000000038a716	vaddps	%ymm3, %ymm1, %ymm1
000000000038a71a	vmulps	%ymm4, %ymm0, %ymm0
000000000038a71e	vmovups	0x80(%r15), %ymm3
000000000038a727	vmovaps	%ymm3, 0x100(%rsp)
000000000038a730	vaddps	%ymm0, %ymm1, %ymm0
000000000038a734	vmovups	0xa0(%r15), %ymm5
000000000038a73d	vmovaps	%ymm5, 0xe0(%rsp)
000000000038a746	vbroadcastss	0x24(%r15), %ymm1
000000000038a74c	vmovups	0x20(%r15), %ymm2
000000000038a752	vmaxps	%ymm3, %ymm0, %ymm0
000000000038a756	vsubps	%ymm5, %ymm1, %ymm1
000000000038a75a	vminps	%ymm1, %ymm0, %ymm0
000000000038a75e	vroundps	$0x9, %ymm0, %ymm3
000000000038a764	vdpps	$0x3f, %ymm2, %ymm3, %ymm4
000000000038a76a	vaddps	%ymm3, %ymm5, %ymm5
000000000038a76e	vminps	%ymm1, %ymm5, %ymm1
000000000038a772	vsubps	%ymm3, %ymm1, %ymm1
000000000038a776	vshufps	$0x2, %ymm4, %ymm3, %ymm5       ## ymm5 = ymm3[2,0],ymm4[0,0],ymm3[6,4],ymm4[4,4]
000000000038a77b	vmulps	%ymm2, %ymm1, %ymm10
000000000038a77f	vshufps	$0xe2, %ymm4, %ymm5, %ymm1      ## ymm1 = ymm5[2,0],ymm4[2,3],ymm5[6,4],ymm4[6,7]
000000000038a784	vaddps	0xc0(%r15), %ymm1, %ymm8
000000000038a78d	vsubps	%ymm3, %ymm0, %ymm15
000000000038a791	vsubps	%ymm6, %ymm8, %ymm0
000000000038a795	vaddps	%ymm0, %ymm14, %ymm0
000000000038a799	vaddps	%ymm8, %ymm10, %ymm1
000000000038a79e	vroundps	$0x1, %ymm0, %ymm2
000000000038a7a4	vblendps	$0x11, %ymm1, %ymm8, %ymm0      ## ymm0 = ymm1[0],ymm8[1,2,3],ymm1[4],ymm8[5,6,7]
000000000038a7aa	vsubps	%ymm6, %ymm0, %ymm1
000000000038a7ae	vaddps	%ymm1, %ymm14, %ymm1
000000000038a7b2	vcvtps2dq	%ymm2, %ymm3
000000000038a7b6	vroundps	$0x1, %ymm1, %ymm1
000000000038a7bc	vcvtps2dq	%ymm1, %ymm1
000000000038a7c0	vextractf128	$0x1, %ymm3, %xmm5
000000000038a7c6	vextractf128	$0x1, %ymm1, %xmm4
000000000038a7cc	vinsertps	$0x4c, %xmm3, %xmm5, %xmm2 ## xmm2 = xmm3[1],xmm5[1],zero,zero
000000000038a7d2	vbroadcastss	0x68(%rsi), %xmm11
000000000038a7d8	vunpcklps	%xmm5, %xmm3, %xmm3     ## xmm3 = xmm3[0],xmm5[0],xmm3[1],xmm5[1]
000000000038a7dc	vunpcklps	%xmm4, %xmm1, %xmm5     ## xmm5 = xmm1[0],xmm4[0],xmm1[1],xmm4[1]
000000000038a7e0	vmovshdup	%ymm10, %ymm12          ## ymm12 = ymm10[1,1,3,3,5,5,7,7]
000000000038a7e5	vaddps	%ymm0, %ymm12, %ymm0
000000000038a7e9	vblendps	$0x11, %ymm0, %ymm8, %ymm7      ## ymm7 = ymm0[0],ymm8[1,2,3],ymm0[4],ymm8[5,6,7]
000000000038a7ef	vunpcklpd	%xmm1, %xmm4, %xmm1     ## xmm1 = xmm4[0],xmm1[0]
000000000038a7f3	vsubps	%ymm6, %ymm7, %ymm4
000000000038a7f7	vaddps	%ymm4, %ymm14, %ymm4
000000000038a7fb	vroundps	$0x1, %ymm4, %ymm4
000000000038a801	vblendpd	$0x1, %xmm2, %xmm5, %xmm2       ## xmm2 = xmm2[0],xmm5[1]
000000000038a807	vcvtps2dq	%ymm4, %ymm4
000000000038a80b	vsubps	%ymm10, %ymm0, %ymm0
000000000038a810	vblendps	$0x11, %ymm0, %ymm8, %ymm0      ## ymm0 = ymm0[0],ymm8[1,2,3],ymm0[4],ymm8[5,6,7]
000000000038a816	vshufps	$0x24, %xmm1, %xmm3, %xmm3      ## xmm3 = xmm3[0,1],xmm1[2,0]
000000000038a81b	vsubps	%ymm6, %ymm0, %ymm1
000000000038a81f	vaddps	%ymm1, %ymm14, %ymm1
000000000038a823	vroundps	$0x1, %ymm1, %ymm1
000000000038a829	vpmulld	%xmm11, %xmm2, %xmm2
000000000038a82e	vcvtps2dq	%ymm1, %ymm5
000000000038a832	vextractf128	$0x1, %ymm4, %xmm9
000000000038a838	vinsertps	$0x4c, %xmm4, %xmm9, %xmm1 ## xmm1 = xmm4[1],xmm9[1],zero,zero
000000000038a83e	vpaddd	%xmm3, %xmm2, %xmm7
000000000038a842	vextractf128	$0x1, %ymm5, %xmm2
000000000038a848	vunpcklps	%xmm2, %xmm5, %xmm13    ## xmm13 = xmm5[0],xmm2[0],xmm5[1],xmm2[1]
000000000038a84c	vunpcklps	%xmm9, %xmm4, %xmm3     ## xmm3 = xmm4[0],xmm9[0],xmm4[1],xmm9[1]
000000000038a851	vunpcklpd	%xmm5, %xmm2, %xmm4     ## xmm4 = xmm2[0],xmm5[0]
000000000038a855	vshufps	$0xaa, %ymm10, %ymm10, %ymm2    ## ymm2 = ymm10[2,2,2,2,6,6,6,6]
000000000038a85b	vaddps	%ymm2, %ymm8, %ymm2
000000000038a85f	vblendps	$0x22, %ymm2, %ymm0, %ymm2      ## ymm2 = ymm0[0],ymm2[1],ymm0[2,3,4],ymm2[5],ymm0[6,7]
000000000038a865	vblendpd	$0x1, %xmm1, %xmm13, %xmm5      ## xmm5 = xmm1[0],xmm13[1]
000000000038a86b	vsubps	%ymm6, %ymm2, %ymm0
000000000038a86f	vaddps	%ymm0, %ymm14, %ymm0
000000000038a873	vroundps	$0x1, %ymm0, %ymm0
000000000038a879	vshufps	$0x24, %xmm4, %xmm3, %xmm3      ## xmm3 = xmm3[0,1],xmm4[2,0]
000000000038a87e	vcvtps2dq	%ymm0, %ymm1
000000000038a882	vsubps	%ymm12, %ymm2, %ymm0
000000000038a887	vblendps	$0x11, %ymm0, %ymm2, %ymm4      ## ymm4 = ymm0[0],ymm2[1,2,3],ymm0[4],ymm2[5,6,7]
000000000038a88d	vpmulld	%xmm11, %xmm5, %xmm5
000000000038a892	vsubps	%ymm6, %ymm4, %ymm4
000000000038a896	vaddps	%ymm4, %ymm14, %ymm4
000000000038a89a	vroundps	$0x1, %ymm4, %ymm4
000000000038a8a0	vpaddd	%xmm3, %xmm5, %xmm9
000000000038a8a4	vcvtps2dq	%ymm4, %ymm3
000000000038a8a8	vextractf128	$0x1, %ymm3, %xmm4
000000000038a8ae	vextractf128	$0x1, %ymm1, %xmm5
000000000038a8b4	vunpcklps	%xmm4, %xmm3, %xmm8     ## xmm8 = xmm3[0],xmm4[0],xmm3[1],xmm4[1]
000000000038a8b8	vinsertps	$0x4c, %xmm1, %xmm5, %xmm13 ## xmm13 = xmm1[1],xmm5[1],zero,zero
000000000038a8be	vblendpd	$0x1, %xmm13, %xmm8, %xmm13     ## xmm13 = xmm13[0],xmm8[1]
000000000038a8c4	movq	0x60(%rsi), %r12
000000000038a8c8	vmovdqa	%xmm7, 0x20(%rsp)
000000000038a8ce	vmovd	%xmm7, %eax
000000000038a8d2	cltq
000000000038a8d4	shlq	$0x4, %rax
000000000038a8d8	vunpcklpd	%xmm3, %xmm4, %xmm3     ## xmm3 = xmm4[0],xmm3[0]
000000000038a8dc	vmovaps	(%r12,%rax), %xmm4
000000000038a8e2	vpextrd	$0x1, %xmm7, %eax
000000000038a8e8	cltq
000000000038a8ea	shlq	$0x4, %rax
000000000038a8ee	vmovdqa	%xmm9, 0x10(%rsp)
000000000038a8f4	vpextrd	$0x2, %xmm9, %edx
000000000038a8fa	vinsertf128	$0x1, (%r12,%rax), %ymm4, %ymm7
000000000038a901	movslq	%edx, %rax
000000000038a904	vpextrd	$0x3, %xmm9, %edx
000000000038a90a	shlq	$0x4, %rax
000000000038a90e	movslq	%edx, %rdx
000000000038a911	shlq	$0x4, %rdx
000000000038a915	vunpcklps	%xmm5, %xmm1, %xmm4     ## xmm4 = xmm1[0],xmm5[0],xmm1[1],xmm5[1]
000000000038a919	vmovaps	(%r12,%rax), %xmm1
000000000038a91f	vpmulld	%xmm11, %xmm13, %xmm5
000000000038a924	vshufps	$0x24, %xmm3, %xmm4, %xmm3      ## xmm3 = xmm4[0,1],xmm3[2,0]
000000000038a929	vpaddd	%xmm3, %xmm5, %xmm3
000000000038a92d	vmovd	%xmm3, %r11d
000000000038a932	vpextrd	$0x1, %xmm3, %r10d
000000000038a938	vpextrd	$0x2, %xmm3, %r13d
000000000038a93e	vaddps	%ymm0, %ymm10, %ymm0
000000000038a942	vblendps	$0x11, %ymm0, %ymm2, %ymm4      ## ymm4 = ymm0[0],ymm2[1,2,3],ymm0[4],ymm2[5,6,7]
000000000038a948	vpextrd	$0x3, %xmm3, %eax
000000000038a94e	vsubps	%ymm6, %ymm4, %ymm3
000000000038a952	vaddps	%ymm3, %ymm14, %ymm3
000000000038a956	vroundps	$0x1, %ymm3, %ymm3
000000000038a95c	movslq	%r11d, %r11
000000000038a95f	vcvtps2dq	%ymm3, %ymm3
000000000038a963	vaddps	%ymm0, %ymm12, %ymm0
000000000038a967	vblendps	$0x11, %ymm0, %ymm2, %ymm0      ## ymm0 = ymm0[0],ymm2[1,2,3],ymm0[4],ymm2[5,6,7]
000000000038a96d	shlq	$0x4, %r11
000000000038a971	vsubps	%ymm6, %ymm0, %ymm0
000000000038a975	vaddps	%ymm0, %ymm14, %ymm0
000000000038a979	vroundps	$0x1, %ymm0, %ymm0
000000000038a97f	movslq	%r10d, %rcx
000000000038a982	vcvtps2dq	%ymm0, %ymm0
000000000038a986	vextractf128	$0x1, %ymm3, %xmm2
000000000038a98c	vinsertps	$0x4c, %xmm3, %xmm2, %xmm4 ## xmm4 = xmm3[1],xmm2[1],zero,zero
000000000038a992	vmovaps	(%r12,%r11), %xmm5
000000000038a998	vextractf128	$0x1, %ymm0, %xmm12
000000000038a99e	vunpcklps	%xmm12, %xmm0, %xmm10   ## xmm10 = xmm0[0],xmm12[0],xmm0[1],xmm12[1]
000000000038a9a3	vblendpd	$0x1, %xmm4, %xmm10, %xmm4      ## xmm4 = xmm4[0],xmm10[1]
000000000038a9a9	shlq	$0x4, %rcx
000000000038a9ad	vpmulld	%xmm11, %xmm4, %xmm4
000000000038a9b2	vunpcklps	%xmm2, %xmm3, %xmm2     ## xmm2 = xmm3[0],xmm2[0],xmm3[1],xmm2[1]
000000000038a9b6	vinsertf128	$0x1, (%r12,%rdx), %ymm1, %ymm3
000000000038a9bd	vunpcklpd	%xmm0, %xmm12, %xmm0    ## xmm0 = xmm12[0],xmm0[0]
000000000038a9c1	vshufps	$0x24, %xmm0, %xmm2, %xmm0      ## xmm0 = xmm2[0,1],xmm0[2,0]
000000000038a9c6	vpaddd	%xmm0, %xmm4, %xmm0
000000000038a9ca	vmovd	%xmm0, %edx
000000000038a9ce	vpextrd	$0x1, %xmm0, %r10d
000000000038a9d4	vinsertf128	$0x1, (%r12,%rcx), %ymm5, %ymm14
000000000038a9db	vpextrd	$0x2, %xmm0, %ecx
000000000038a9e1	movslq	%ecx, %rcx
000000000038a9e4	shlq	$0x4, %rcx
000000000038a9e8	vpextrd	$0x3, %xmm0, %r11d
000000000038a9ee	movslq	%r11d, %r11
000000000038a9f1	vmovaps	(%r12,%rcx), %xmm0
000000000038a9f7	shlq	$0x4, %r11
000000000038a9fb	vmovaps	%ymm15, %ymm10
000000000038aa00	vshufps	$0x68, %ymm15, %ymm15, %ymm1    ## ymm1 = ymm15[0,2,2,1,4,6,6,5]
000000000038aa06	vinsertf128	$0x1, (%r12,%r11), %ymm0, %ymm9
000000000038aa0d	vshufps	$0x91, %ymm15, %ymm15, %ymm0    ## ymm0 = ymm15[1,0,1,2,5,4,5,6]
000000000038aa13	vcmpltps	%ymm1, %ymm0, %ymm0
000000000038aa18	vmovaps	%ymm3, 0xc0(%rsp)
000000000038aa21	vsubps	%ymm7, %ymm3, %ymm2
000000000038aa25	vmovaps	%ymm7, 0x60(%rsp)
000000000038aa2b	vsubps	%ymm14, %ymm9, %ymm1
000000000038aa30	vmovaps	%ymm9, 0x80(%rsp)
000000000038aa39	vsubps	%ymm3, %ymm14, %ymm4
000000000038aa3d	vshufps	$0x0, %ymm15, %ymm15, %ymm11    ## ymm11 = ymm15[0,0,0,0,4,4,4,4]
000000000038aa43	vshufps	$0x55, %ymm15, %ymm15, %ymm15   ## ymm15 = ymm15[1,1,1,1,5,5,5,5]
000000000038aa49	vmulps	%ymm1, %ymm11, %ymm6
000000000038aa4d	vmulps	%ymm2, %ymm15, %ymm1
000000000038aa51	vmovaps	%ymm1, 0xa0(%rsp)
000000000038aa5a	vshufps	$0xaa, %ymm10, %ymm10, %ymm12   ## ymm12 = ymm10[2,2,2,2,6,6,6,6]
000000000038aa60	vmulps	%ymm4, %ymm12, %ymm2
000000000038aa64	vaddps	%ymm6, %ymm1, %ymm4
000000000038aa68	vaddps	%ymm4, %ymm2, %ymm8
000000000038aa6c	vmovaps	0xe0(%rsp), %ymm13
000000000038aa75	vandps	%ymm0, %ymm13, %ymm3
000000000038aa79	vshufps	$0x0, %ymm3, %ymm3, %ymm2       ## ymm2 = ymm3[0,0,0,0,4,4,4,4]
000000000038aa7e	vshufps	$0x55, %ymm3, %ymm3, %ymm5      ## ymm5 = ymm3[1,1,1,1,5,5,5,5]
000000000038aa83	vminps	%ymm5, %ymm2, %ymm4
000000000038aa87	movslq	%r13d, %rcx
000000000038aa8a	cltq
000000000038aa8c	shlq	$0x4, %rcx
000000000038aa90	shlq	$0x4, %rax
000000000038aa94	movslq	%edx, %rdx
000000000038aa97	shlq	$0x4, %rdx
000000000038aa9b	movslq	%r10d, %r10
000000000038aa9e	shlq	$0x4, %r10
000000000038aaa2	vmovaps	(%r12,%rcx), %xmm2
000000000038aaa8	vinsertf128	$0x1, (%r12,%rax), %ymm2, %ymm0
000000000038aaaf	vmovaps	(%r12,%rdx), %xmm2
000000000038aab5	vinsertf128	$0x1, (%r12,%r10), %ymm2, %ymm2
000000000038aabc	vsubps	%ymm0, %ymm2, %ymm5
000000000038aac0	vmulps	%ymm5, %ymm11, %ymm1
000000000038aac4	vsubps	%ymm2, %ymm9, %ymm5
000000000038aac8	vmulps	%ymm5, %ymm15, %ymm5
000000000038aacc	vaddps	%ymm5, %ymm1, %ymm1
000000000038aad0	vsubps	%ymm7, %ymm0, %ymm9
000000000038aad4	vmulps	%ymm9, %ymm12, %ymm9
000000000038aad9	vmovaps	0x100(%rsp), %ymm7
000000000038aae2	vcmpltps	%ymm4, %ymm7, %ymm4
000000000038aae7	vaddps	%ymm1, %ymm9, %ymm1
000000000038aaeb	vblendvps	%ymm4, %ymm1, %ymm8, %ymm1
000000000038aaf1	vshufps	$0x81, %ymm10, %ymm10, %ymm4    ## ymm4 = ymm10[1,0,0,2,5,4,4,6]
000000000038aaf7	vshufps	$0x64, %ymm10, %ymm10, %ymm8    ## ymm8 = ymm10[0,1,2,1,4,5,6,5]
000000000038aafd	vcmpleps	%ymm4, %ymm8, %ymm4
000000000038ab02	vsubps	%ymm0, %ymm14, %ymm0
000000000038ab06	vmulps	%ymm0, %ymm15, %ymm0
000000000038ab0a	vaddps	%ymm6, %ymm0, %ymm0
000000000038ab0e	vaddps	%ymm0, %ymm9, %ymm0
000000000038ab12	vandps	%ymm4, %ymm13, %ymm14
000000000038ab16	vshufps	$0x0, %ymm14, %ymm14, %ymm4     ## ymm4 = ymm14[0,0,0,0,4,4,4,4]
000000000038ab1c	vshufps	$0xaa, %ymm3, %ymm3, %ymm6      ## ymm6 = ymm3[2,2,2,2,6,6,6,6]
000000000038ab21	vminps	%ymm6, %ymm4, %ymm4
000000000038ab25	vcmpltps	%ymm4, %ymm7, %ymm4
000000000038ab2a	vblendvps	%ymm4, %ymm0, %ymm1, %ymm4
000000000038ab30	vmovaps	0x20(%rsp), %xmm0
000000000038ab36	vextractps	$0x2, %xmm0, %eax
000000000038ab3c	vextractps	$0x3, %xmm0, %ecx
000000000038ab42	vmovdqa	0x10(%rsp), %xmm0
000000000038ab48	vmovd	%xmm0, %edx
000000000038ab4c	vpextrd	$0x1, %xmm0, %r10d
000000000038ab52	cltq
000000000038ab54	shlq	$0x4, %rax
000000000038ab58	movslq	%ecx, %rcx
000000000038ab5b	shlq	$0x4, %rcx
000000000038ab5f	movslq	%edx, %rdx
000000000038ab62	vmovaps	(%r12,%rax), %xmm0
000000000038ab68	vinsertf128	$0x1, (%r12,%rcx), %ymm0, %ymm1
000000000038ab6f	movq	0x8(%rsp), %rcx
000000000038ab74	shlq	$0x4, %rdx
000000000038ab78	movslq	%r10d, %rax
000000000038ab7b	shlq	$0x4, %rax
000000000038ab7f	vmovaps	(%r12,%rdx), %xmm0
000000000038ab85	vinsertf128	$0x1, (%r12,%rax), %ymm0, %ymm0
000000000038ab8c	vsubps	%ymm1, %ymm0, %ymm6
000000000038ab90	vmulps	%ymm6, %ymm15, %ymm6
000000000038ab94	vshufps	$0xff, %ymm3, %ymm3, %ymm3      ## ymm3 = ymm3[3,3,3,3,7,7,7,7]
000000000038ab99	vshufps	$0x55, %ymm14, %ymm14, %ymm8    ## ymm8 = ymm14[1,1,1,1,5,5,5,5]
000000000038ab9f	vminps	%ymm8, %ymm3, %ymm3
000000000038aba4	vmovaps	0x80(%rsp), %ymm8
000000000038abad	vsubps	%ymm0, %ymm8, %ymm8
000000000038abb1	vmovaps	0x60(%rsp), %ymm15
000000000038abb7	vsubps	%ymm15, %ymm1, %ymm9
000000000038abbc	vmulps	%ymm9, %ymm11, %ymm9
000000000038abc1	vaddps	%ymm6, %ymm9, %ymm6
000000000038abc5	vmulps	%ymm8, %ymm12, %ymm8
000000000038abca	vaddps	%ymm6, %ymm8, %ymm6
000000000038abce	vcmpltps	%ymm3, %ymm7, %ymm3
000000000038abd3	vblendvps	%ymm3, %ymm6, %ymm4, %ymm3
000000000038abd9	vmovshdup	%ymm10, %ymm4           ## ymm4 = ymm10[1,1,3,3,5,5,7,7]
000000000038abde	vcmpltps	%ymm4, %ymm10, %ymm4
000000000038abe3	vandps	%ymm4, %ymm13, %ymm4
000000000038abe7	vsubps	0xc0(%rsp), %ymm0, %ymm0
000000000038abf0	vmulps	%ymm0, %ymm11, %ymm0
000000000038abf4	vaddps	0xa0(%rsp), %ymm0, %ymm0
000000000038abfd	vaddps	%ymm0, %ymm8, %ymm0
000000000038ac01	vshufps	$0xaa, %ymm14, %ymm14, %ymm6    ## ymm6 = ymm14[2,2,2,2,6,6,6,6]
000000000038ac07	vshufps	$0x0, %ymm4, %ymm4, %ymm4       ## ymm4 = ymm4[0,0,0,0,4,4,4,4]
000000000038ac0c	vminps	%ymm4, %ymm6, %ymm4
000000000038ac10	vcmpltps	%ymm4, %ymm7, %ymm4
000000000038ac15	vblendvps	%ymm4, %ymm0, %ymm3, %ymm0
000000000038ac1b	vsubps	%ymm1, %ymm2, %ymm1
000000000038ac1f	vaddps	%ymm5, %ymm9, %ymm2
000000000038ac23	vmulps	%ymm1, %ymm12, %ymm1
000000000038ac27	vshufps	$0xff, %ymm14, %ymm14, %ymm3    ## ymm3 = ymm14[3,3,3,3,7,7,7,7]
000000000038ac2d	vmovaps	0x5099eb(%rip), %ymm14
000000000038ac35	vminps	%ymm6, %ymm3, %ymm3
000000000038ac39	vmovaps	0x40(%rsp), %ymm6
000000000038ac3f	vaddps	%ymm2, %ymm1, %ymm1
000000000038ac43	vcmpltps	%ymm3, %ymm7, %ymm2
000000000038ac48	vblendvps	%ymm2, %ymm1, %ymm0, %ymm0
000000000038ac4e	vaddps	%ymm0, %ymm15, %ymm0
000000000038ac52	vbroadcastss	0x8(%r15), %ymm1
000000000038ac58	vmulps	%ymm0, %ymm1, %ymm0
000000000038ac5c	vmovups	0x40(%r15), %ymm1
000000000038ac62	vcmpltps	%ymm7, %ymm1, %ymm1
000000000038ac67	vbroadcastss	0xc(%r15), %ymm2
000000000038ac6d	vaddps	%ymm0, %ymm2, %ymm0
000000000038ac71	vblendvps	%ymm1, 0x120(%rsp), %ymm0, %ymm0
000000000038ac7c	vmovups	%ymm0, -0x10(%r8,%r14)
000000000038ac83	addq	$0x20, %r14
000000000038ac87	movl	%ebx, %eax
000000000038ac89	addl	$-0x2, %ebx
000000000038ac8c	addl	%ecx, %eax
000000000038ac8e	addl	$-0x2, %eax
000000000038ac91	cmpl	$0x1, %eax
000000000038ac94	jg	0x38a6c0
000000000038ac9a	negl	%ebx
000000000038ac9c	movl	0x4(%rsp), %r11d
000000000038aca1	movl	(%rsp), %eax
000000000038aca4	cmpl	%ecx, %ebx
000000000038aca6	jge	0x38a690
000000000038acac	movl	%ebx, %ebx
000000000038acae	shlq	$0x4, %rbx
000000000038acb2	vmovaps	(%r9,%rbx), %xmm1
000000000038acb8	vmovaps	%xmm1, 0x120(%rsp)
000000000038acc1	movq	0x198(%rdi), %r14
000000000038acc8	vbroadcastss	(%r14), %xmm0
000000000038accd	vmulps	%xmm0, %xmm1, %xmm0
000000000038acd1	vbroadcastss	0x4(%r14), %xmm1
000000000038acd7	vaddps	%xmm1, %xmm0, %xmm0
000000000038acdb	vmulps	%xmm0, %xmm0, %xmm1
000000000038acdf	vmulps	%xmm1, %xmm0, %xmm2
000000000038ace3	vbroadcastss	0x64(%r14), %xmm3
000000000038ace9	vmulps	%xmm3, %xmm0, %xmm0
000000000038aced	vbroadcastss	0x60(%r14), %xmm3
000000000038acf3	vaddps	%xmm3, %xmm0, %xmm0
000000000038acf7	vbroadcastss	0x68(%r14), %xmm3
000000000038acfd	vmulps	%xmm3, %xmm1, %xmm1
000000000038ad01	vaddps	%xmm1, %xmm0, %xmm0
000000000038ad05	vbroadcastss	0x6c(%r14), %xmm1
000000000038ad0b	vmulps	%xmm1, %xmm2, %xmm1
000000000038ad0f	vaddps	%xmm1, %xmm0, %xmm0
000000000038ad13	vmovaps	0x20(%r14), %xmm1
000000000038ad19	vmovaps	0x80(%r14), %xmm2
000000000038ad22	vmovaps	%xmm2, 0x100(%rsp)
000000000038ad2b	vmovaps	0xa0(%r14), %xmm12
000000000038ad34	vmaxps	%xmm2, %xmm0, %xmm0
000000000038ad38	vbroadcastss	0x24(%r14), %xmm2
000000000038ad3e	vsubps	%xmm12, %xmm2, %xmm2
000000000038ad43	vminps	%xmm2, %xmm0, %xmm0
000000000038ad47	vroundps	$0x9, %xmm0, %xmm3
000000000038ad4d	vsubps	%xmm3, %xmm0, %xmm9
000000000038ad51	vaddps	%xmm3, %xmm12, %xmm0
000000000038ad55	vminps	%xmm2, %xmm0, %xmm0
000000000038ad59	vdpps	$0x3f, %xmm1, %xmm3, %xmm2
000000000038ad5f	vsubps	%xmm3, %xmm0, %xmm0
000000000038ad63	vinsertps	$0x90, %xmm3, %xmm2, %xmm2 ## xmm2 = xmm2[0],xmm3[2],xmm2[2,3]
000000000038ad69	vaddps	0xc0(%r14), %xmm2, %xmm3
000000000038ad72	vmulps	%xmm1, %xmm0, %xmm13
000000000038ad76	movl	0x68(%rsi), %r12d
000000000038ad7a	vsubps	%xmm6, %xmm3, %xmm0
000000000038ad7e	vbroadcastss	0x3cf41(%rip), %xmm7
000000000038ad87	vaddps	%xmm7, %xmm0, %xmm0
000000000038ad8b	vroundps	$0x1, %xmm0, %xmm0
000000000038ad91	vcvtps2dq	%xmm0, %xmm0
000000000038ad95	movq	0x60(%rsi), %r15
000000000038ad99	vmovd	%xmm0, %eax
000000000038ad9d	vpextrd	$0x1, %xmm0, %ecx
000000000038ada3	imull	%r12d, %ecx
000000000038ada7	addl	%eax, %ecx
000000000038ada9	movslq	%ecx, %rax
000000000038adac	shlq	$0x4, %rax
000000000038adb0	vmovaps	(%r15,%rax), %xmm4
000000000038adb6	vaddss	%xmm13, %xmm3, %xmm0
000000000038adbb	vmovaps	%xmm0, 0xe0(%rsp)
000000000038adc4	vmovaps	%xmm3, 0x10(%rsp)
000000000038adca	vmovshdup	%xmm13, %xmm2           ## xmm2 = xmm13[1,1,3,3]
000000000038adcf	vaddps	%xmm0, %xmm2, %xmm0
000000000038add3	vmovaps	%xmm0, 0x20(%rsp)
000000000038add9	vsubps	%xmm13, %xmm0, %xmm0
000000000038adde	vblendps	$0x1, %xmm0, %xmm3, %xmm0       ## xmm0 = xmm0[0],xmm3[1,2,3]
000000000038ade4	vsubps	%xmm6, %xmm0, %xmm1
000000000038ade8	vaddps	%xmm7, %xmm1, %xmm1
000000000038adec	vroundps	$0x1, %xmm1, %xmm1
000000000038adf2	vcvtps2dq	%xmm1, %xmm1
000000000038adf6	vmovd	%xmm1, %eax
000000000038adfa	vpextrd	$0x1, %xmm1, %ecx
000000000038ae00	imull	%r12d, %ecx
000000000038ae04	addl	%eax, %ecx
000000000038ae06	movslq	%ecx, %rax
000000000038ae09	shlq	$0x4, %rax
000000000038ae0d	vmovaps	(%r15,%rax), %xmm8
000000000038ae13	vshufps	$0xaa, %xmm13, %xmm13, %xmm1    ## xmm1 = xmm13[2,2,2,2]
000000000038ae19	vaddps	%xmm3, %xmm1, %xmm1
000000000038ae1d	vblendps	$0x2, %xmm1, %xmm0, %xmm0       ## xmm0 = xmm0[0],xmm1[1],xmm0[2,3]
000000000038ae23	vsubps	%xmm6, %xmm0, %xmm1
000000000038ae27	vaddps	%xmm7, %xmm1, %xmm1
000000000038ae2b	vroundps	$0x1, %xmm1, %xmm1
000000000038ae31	vcvtps2dq	%xmm1, %xmm1
000000000038ae35	vmovd	%xmm1, %eax
000000000038ae39	vpextrd	$0x1, %xmm1, %ecx
000000000038ae3f	imull	%r12d, %ecx
000000000038ae43	addl	%eax, %ecx
000000000038ae45	movslq	%ecx, %rax
000000000038ae48	shlq	$0x4, %rax
000000000038ae4c	vmovaps	(%r15,%rax), %xmm10
000000000038ae52	vsubps	%xmm2, %xmm0, %xmm1
000000000038ae56	vsubss	%xmm2, %xmm0, %xmm3
000000000038ae5a	vsubps	%xmm6, %xmm3, %xmm3
000000000038ae5e	vaddps	%xmm7, %xmm3, %xmm3
000000000038ae62	vroundps	$0x1, %xmm3, %xmm3
000000000038ae68	vcvtps2dq	%xmm3, %xmm3
000000000038ae6c	vmovd	%xmm3, %eax
000000000038ae70	vpextrd	$0x1, %xmm3, %r13d
000000000038ae76	vaddps	%xmm1, %xmm13, %xmm1
000000000038ae7a	vblendps	$0x1, %xmm1, %xmm0, %xmm3       ## xmm3 = xmm1[0],xmm0[1,2,3]
000000000038ae80	vsubps	%xmm6, %xmm3, %xmm3
000000000038ae84	vaddps	%xmm7, %xmm3, %xmm3
000000000038ae88	vroundps	$0x1, %xmm3, %xmm3
000000000038ae8e	vcvtps2dq	%xmm3, %xmm3
000000000038ae92	vaddps	%xmm1, %xmm2, %xmm1
000000000038ae96	vblendps	$0x1, %xmm1, %xmm0, %xmm0       ## xmm0 = xmm1[0],xmm0[1,2,3]
000000000038ae9c	vsubps	%xmm6, %xmm0, %xmm0
000000000038aea0	vaddps	%xmm7, %xmm0, %xmm0
000000000038aea4	vroundps	$0x1, %xmm0, %xmm0
000000000038aeaa	vcvtps2dq	%xmm0, %xmm0
000000000038aeae	vmovd	%xmm0, %ecx
000000000038aeb2	vpextrd	$0x1, %xmm0, %r10d
000000000038aeb8	imull	%r12d, %r10d
000000000038aebc	addl	%ecx, %r10d
000000000038aebf	vmovd	%xmm3, %edx
000000000038aec3	movslq	%r10d, %rcx
000000000038aec6	shlq	$0x4, %rcx
000000000038aeca	vmovaps	(%r15,%rcx), %xmm11
000000000038aed0	vpextrd	$0x1, %xmm3, %r10d
000000000038aed6	vshufps	$0x68, %xmm9, %xmm9, %xmm0      ## xmm0 = xmm9[0,2,2,1]
000000000038aedc	vshufps	$0x91, %xmm9, %xmm9, %xmm1      ## xmm1 = xmm9[1,0,1,2]
000000000038aee2	vcmpltps	%xmm0, %xmm1, %xmm2
000000000038aee7	vmovaps	%xmm10, %xmm13
000000000038aeec	vsubps	%xmm10, %xmm11, %xmm0
000000000038aef1	vmovaps	%xmm11, 0x80(%rsp)
000000000038aefa	vmovaps	%xmm4, %xmm10
000000000038aefe	vmovaps	%xmm4, 0x60(%rsp)
000000000038af04	vmovaps	%xmm8, 0xc0(%rsp)
000000000038af0d	vsubps	%xmm4, %xmm8, %xmm3
000000000038af11	vshufps	$0x0, %xmm9, %xmm9, %xmm15      ## xmm15 = xmm9[0,0,0,0]
000000000038af17	vmulps	%xmm0, %xmm15, %xmm7
000000000038af1b	vshufps	$0x55, %xmm9, %xmm9, %xmm6      ## xmm6 = xmm9[1,1,1,1]
000000000038af21	vmulps	%xmm3, %xmm6, %xmm0
000000000038af25	vmovaps	%xmm0, 0xa0(%rsp)
000000000038af2e	vsubps	%xmm8, %xmm13, %xmm3
000000000038af33	vshufps	$0xaa, %xmm9, %xmm9, %xmm14     ## xmm14 = xmm9[2,2,2,2]
000000000038af39	vmulps	%xmm3, %xmm14, %xmm3
000000000038af3d	vaddps	%xmm7, %xmm0, %xmm4
000000000038af41	vaddps	%xmm4, %xmm3, %xmm8
000000000038af45	vandps	%xmm2, %xmm12, %xmm2
000000000038af49	vshufps	$0x0, %xmm2, %xmm2, %xmm4       ## xmm4 = xmm2[0,0,0,0]
000000000038af4e	vshufps	$0x55, %xmm2, %xmm2, %xmm5      ## xmm5 = xmm2[1,1,1,1]
000000000038af53	vminps	%xmm5, %xmm4, %xmm3
000000000038af57	imull	%r12d, %r13d
000000000038af5b	addl	%eax, %r13d
000000000038af5e	movslq	%r13d, %rax
000000000038af61	shlq	$0x4, %rax
000000000038af65	imull	%r12d, %r10d
000000000038af69	addl	%edx, %r10d
000000000038af6c	movslq	%r10d, %rcx
000000000038af6f	shlq	$0x4, %rcx
000000000038af73	vmovaps	(%r15,%rax), %xmm0
000000000038af79	vmovaps	(%r15,%rcx), %xmm4
000000000038af7f	vsubps	%xmm0, %xmm4, %xmm5
000000000038af83	vmulps	%xmm5, %xmm15, %xmm1
000000000038af87	vsubps	%xmm4, %xmm11, %xmm5
000000000038af8b	vmulps	%xmm5, %xmm6, %xmm5
000000000038af8f	vaddps	%xmm5, %xmm1, %xmm1
000000000038af93	vsubps	%xmm10, %xmm0, %xmm11
000000000038af98	vmulps	%xmm11, %xmm14, %xmm11
000000000038af9d	vaddps	%xmm1, %xmm11, %xmm1
000000000038afa1	vmovaps	0x100(%rsp), %xmm10
000000000038afaa	vcmpnleps	%xmm10, %xmm3, %xmm3
000000000038afb0	vblendvps	%xmm3, %xmm1, %xmm8, %xmm3
000000000038afb6	vshufps	$0x81, %xmm9, %xmm9, %xmm1      ## xmm1 = xmm9[1,0,0,2]
000000000038afbc	vshufps	$0x64, %xmm9, %xmm9, %xmm8      ## xmm8 = xmm9[0,1,2,1]
000000000038afc2	vcmpleps	%xmm1, %xmm8, %xmm1
000000000038afc7	vsubps	%xmm0, %xmm13, %xmm0
000000000038afcb	vmulps	%xmm0, %xmm6, %xmm0
000000000038afcf	vaddps	%xmm7, %xmm0, %xmm0
000000000038afd3	vaddps	%xmm0, %xmm11, %xmm0
000000000038afd7	vandps	%xmm1, %xmm12, %xmm1
000000000038afdb	vshufps	$0x0, %xmm1, %xmm1, %xmm7       ## xmm7 = xmm1[0,0,0,0]
000000000038afe0	vshufps	$0xaa, %xmm2, %xmm2, %xmm8      ## xmm8 = xmm2[2,2,2,2]
000000000038afe5	vminps	%xmm8, %xmm7, %xmm7
000000000038afea	vcmpnleps	%xmm10, %xmm7, %xmm7
000000000038aff0	vblendvps	%xmm7, %xmm0, %xmm3, %xmm3
000000000038aff6	vmovaps	0xe0(%rsp), %xmm0
000000000038afff	vsubps	0x40(%rsp), %xmm0, %xmm0
000000000038b005	vbroadcastss	0x3ccba(%rip), %xmm7
000000000038b00e	vaddps	%xmm7, %xmm0, %xmm0
000000000038b012	vroundps	$0x1, %xmm0, %xmm0
000000000038b018	vcvtps2dq	%xmm0, %xmm0
000000000038b01c	vmovd	%xmm0, %eax
000000000038b020	vpextrd	$0x1, %xmm0, %ecx
000000000038b026	vmovaps	0x10(%rsp), %xmm0
000000000038b02c	vblendps	$0x1, 0x20(%rsp), %xmm0, %xmm0  ## xmm0 = mem[0],xmm0[1,2,3]
000000000038b034	vsubps	0x40(%rsp), %xmm0, %xmm0
000000000038b03a	vaddps	%xmm7, %xmm0, %xmm0
000000000038b03e	vroundps	$0x1, %xmm0, %xmm0
000000000038b044	vcvtps2dq	%xmm0, %xmm0
000000000038b048	vmovd	%xmm0, %edx
000000000038b04c	vpextrd	$0x1, %xmm0, %r10d
000000000038b052	imull	%r12d, %ecx
000000000038b056	addl	%eax, %ecx
000000000038b058	imull	%r12d, %r10d
000000000038b05c	movslq	%ecx, %rax
000000000038b05f	shlq	$0x4, %rax
000000000038b063	addl	%edx, %r10d
000000000038b066	movslq	%r10d, %rcx
000000000038b069	shlq	$0x4, %rcx
000000000038b06d	vmovaps	(%r15,%rax), %xmm8
000000000038b073	movl	(%rsp), %eax
000000000038b076	vmovaps	(%r15,%rcx), %xmm0
000000000038b07c	movq	0x8(%rsp), %rcx
000000000038b081	vsubps	%xmm8, %xmm0, %xmm7
000000000038b086	vmulps	%xmm7, %xmm6, %xmm6
000000000038b08a	vshufps	$0xff, %xmm2, %xmm2, %xmm2      ## xmm2 = xmm2[3,3,3,3]
000000000038b08f	vshufps	$0x55, %xmm1, %xmm1, %xmm7      ## xmm7 = xmm1[1,1,1,1]
000000000038b094	vminps	%xmm7, %xmm2, %xmm2
000000000038b098	vmovaps	0x80(%rsp), %xmm7
000000000038b0a1	vsubps	%xmm0, %xmm7, %xmm7
000000000038b0a5	vmovaps	0x60(%rsp), %xmm13
000000000038b0ab	vsubps	%xmm13, %xmm8, %xmm11
000000000038b0b0	vmulps	%xmm11, %xmm15, %xmm11
000000000038b0b5	vaddps	%xmm6, %xmm11, %xmm6
000000000038b0b9	vmulps	%xmm7, %xmm14, %xmm7
000000000038b0bd	vaddps	%xmm7, %xmm6, %xmm6
000000000038b0c1	vcmpnleps	%xmm10, %xmm2, %xmm2
000000000038b0c7	vblendvps	%xmm2, %xmm6, %xmm3, %xmm2
000000000038b0cd	vmovshdup	%xmm9, %xmm3            ## xmm3 = xmm9[1,1,3,3]
000000000038b0d2	vcmpltss	%xmm3, %xmm9, %xmm3
000000000038b0d7	vandps	%xmm3, %xmm12, %xmm3
000000000038b0db	vsubps	0xc0(%rsp), %xmm0, %xmm0
000000000038b0e4	vmulps	%xmm0, %xmm15, %xmm0
000000000038b0e8	vaddps	0xa0(%rsp), %xmm0, %xmm0
000000000038b0f1	vaddps	%xmm7, %xmm0, %xmm0
000000000038b0f5	vshufps	$0xaa, %xmm1, %xmm1, %xmm6      ## xmm6 = xmm1[2,2,2,2]
000000000038b0fa	vshufps	$0x0, %xmm3, %xmm3, %xmm3       ## xmm3 = xmm3[0,0,0,0]
000000000038b0ff	vminps	%xmm3, %xmm6, %xmm3
000000000038b103	vcmpnleps	%xmm10, %xmm3, %xmm3
000000000038b109	vblendvps	%xmm3, %xmm0, %xmm2, %xmm0
000000000038b10f	vsubps	%xmm8, %xmm4, %xmm2
000000000038b114	vaddps	%xmm5, %xmm11, %xmm3
000000000038b118	vmulps	%xmm2, %xmm14, %xmm2
000000000038b11c	vmovaps	0x5094fc(%rip), %ymm14
000000000038b124	vaddps	%xmm3, %xmm2, %xmm2
000000000038b128	vshufps	$0xff, %xmm1, %xmm1, %xmm1      ## xmm1 = xmm1[3,3,3,3]
000000000038b12d	vminps	%xmm6, %xmm1, %xmm1
000000000038b131	vmovaps	0x40(%rsp), %ymm6
000000000038b137	vcmpnleps	%xmm10, %xmm1, %xmm1
000000000038b13d	vblendvps	%xmm1, %xmm2, %xmm0, %xmm0
000000000038b143	vaddps	%xmm0, %xmm13, %xmm0
000000000038b147	vbroadcastss	0x8(%r14), %xmm1
000000000038b14d	vmulps	%xmm0, %xmm1, %xmm0
000000000038b151	vbroadcastss	0xc(%r14), %xmm1
000000000038b157	vaddps	%xmm0, %xmm1, %xmm0
000000000038b15b	vmovaps	0x40(%r14), %xmm1
000000000038b161	vcmpltps	%xmm10, %xmm1, %xmm1
000000000038b167	vblendvps	%xmm1, 0x120(%rsp), %xmm0, %xmm0
000000000038b172	vmovaps	%xmm0, (%r8,%rbx)
000000000038b178	jmp	0x38a690
000000000038b17d	leaq	-0x28(%rbp), %rsp
000000000038b181	popq	%rbx
000000000038b182	popq	%r12
000000000038b184	popq	%r13
000000000038b186	popq	%r14
000000000038b188	popq	%r15
000000000038b18a	popq	%rbp
000000000038b18b	vzeroupper
000000000038b18e	xorl	%eax, %eax
000000000038b190	retq
000000000038b191	nopw	%cs:(%rax,%rax)
