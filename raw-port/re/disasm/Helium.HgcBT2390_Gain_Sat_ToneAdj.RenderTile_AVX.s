__ZN26HgcBT2390_Gain_Sat_ToneAdj14RenderTile_AVXEP6HGTile:
000000000035e380	movl	0xc(%rsi), %eax
000000000035e383	subl	0x4(%rsi), %eax
000000000035e386	jle	0x35ec72
000000000035e38c	pushq	%rbp
000000000035e38d	movq	%rsp, %rbp
000000000035e390	pushq	%r14
000000000035e392	pushq	%rbx
000000000035e393	andq	$-0x20, %rsp
000000000035e397	subq	$0x180, %rsp                    ## imm = 0x180
000000000035e39e	movl	0x8(%rsi), %ecx
000000000035e3a1	subl	(%rsi), %ecx
000000000035e3a3	movslq	0x18(%rsi), %rdx
000000000035e3a7	movq	0x10(%rsi), %r8
000000000035e3ab	movq	0x50(%rsi), %r9
000000000035e3af	movslq	0x58(%rsi), %rsi
000000000035e3b3	shlq	$0x4, %rdx
000000000035e3b7	shlq	$0x4, %rsi
000000000035e3bb	xorl	%r10d, %r10d
000000000035e3be	jmp	0x35e3d2
000000000035e3c0	addq	%rsi, %r9
000000000035e3c3	addq	%rdx, %r8
000000000035e3c6	incl	%r10d
000000000035e3c9	cmpl	%eax, %r10d
000000000035e3cc	je	0x35ec6a
000000000035e3d2	movl	$0x0, %r11d
000000000035e3d8	cmpl	$0x2, %ecx
000000000035e3db	jl	0x35e860
000000000035e3e1	movl	$0x10, %ebx
000000000035e3e6	xorl	%r11d, %r11d
000000000035e3e9	nopl	(%rax)
000000000035e3f0	vmovups	-0x10(%r9,%rbx), %ymm0
000000000035e3f7	movq	0x198(%rdi), %r14
000000000035e3fe	vmovups	(%r14), %ymm1
000000000035e403	vmovaps	%ymm1, 0x140(%rsp)
000000000035e40c	vmovups	0x40(%r14), %ymm6
000000000035e412	vmaxps	%ymm1, %ymm0, %ymm13
000000000035e416	vmulps	0x20(%r14), %ymm13, %ymm11
000000000035e41c	vmovups	0x60(%r14), %ymm7
000000000035e422	vcmpeqps	%ymm1, %ymm6, %ymm0
000000000035e427	vmovaps	%ymm6, 0x60(%rsp)
000000000035e42d	vandps	%ymm7, %ymm0, %ymm0
000000000035e431	vcmpltps	%ymm0, %ymm1, %ymm0
000000000035e436	vblendvps	%ymm0, %ymm7, %ymm11, %ymm0
000000000035e43c	vandps	0x80(%r14), %ymm0, %ymm1
000000000035e445	vmovups	0xa0(%r14), %ymm2
000000000035e44e	vmovaps	%ymm2, 0x120(%rsp)
000000000035e457	vmovups	0xc0(%r14), %ymm4
000000000035e460	vmovaps	%ymm4, 0x100(%rsp)
000000000035e469	vcmpltps	%ymm2, %ymm0, %ymm2
000000000035e46e	vpsrld	$0x17, %xmm0, %xmm3
000000000035e473	vextractf128	$0x1, %ymm0, %xmm0
000000000035e479	vpsrld	$0x17, %xmm0, %xmm0
000000000035e47e	vandps	%ymm4, %ymm2, %ymm2
000000000035e482	vinsertf128	$0x1, %xmm0, %ymm3, %ymm0
000000000035e488	vcvtdq2ps	%ymm0, %ymm3
000000000035e48c	vmovups	0x100(%r14), %ymm0
000000000035e495	vmovaps	%ymm0, 0xe0(%rsp)
000000000035e49e	vorps	%ymm7, %ymm1, %ymm1
000000000035e4a2	vcmpltps	%ymm1, %ymm0, %ymm0
000000000035e4a7	vandps	%ymm7, %ymm0, %ymm0
000000000035e4ab	vmovups	0x120(%r14), %ymm4
000000000035e4b4	vmovaps	%ymm4, 0xc0(%rsp)
000000000035e4bd	vsubps	%ymm2, %ymm3, %ymm2
000000000035e4c1	vmulps	%ymm0, %ymm4, %ymm3
000000000035e4c5	vmulps	%ymm1, %ymm3, %ymm3
000000000035e4c9	vsubps	%ymm7, %ymm1, %ymm1
000000000035e4cd	vsubps	%ymm3, %ymm1, %ymm1
000000000035e4d1	vmovups	0x140(%r14), %ymm3
000000000035e4da	vmovaps	%ymm3, 0xa0(%rsp)
000000000035e4e3	vmulps	%ymm1, %ymm3, %ymm3
000000000035e4e7	vmovups	0x160(%r14), %ymm4
000000000035e4f0	vmovaps	%ymm4, 0x80(%rsp)
000000000035e4f9	vaddps	%ymm3, %ymm4, %ymm3
000000000035e4fd	vmovups	0x180(%r14), %ymm4
000000000035e506	vmovaps	%ymm4, 0x40(%rsp)
000000000035e50c	vmulps	%ymm1, %ymm4, %ymm4
000000000035e510	vmovups	0x1a0(%r14), %ymm5
000000000035e519	vmovaps	%ymm5, (%rsp)
000000000035e51e	vaddps	%ymm4, %ymm5, %ymm4
000000000035e522	vmulps	%ymm1, %ymm1, %ymm5
000000000035e526	vmulps	%ymm4, %ymm5, %ymm4
000000000035e52a	vaddps	%ymm4, %ymm3, %ymm3
000000000035e52e	vmulps	%ymm3, %ymm5, %ymm3
000000000035e532	vmovups	0x1c0(%r14), %ymm14
000000000035e53b	vmulps	%ymm1, %ymm14, %ymm4
000000000035e53f	vmovups	0x1e0(%r14), %ymm15
000000000035e548	vaddps	%ymm4, %ymm15, %ymm4
000000000035e54c	vaddps	%ymm3, %ymm4, %ymm3
000000000035e550	vmulps	%ymm3, %ymm1, %ymm3
000000000035e554	vmovups	0x200(%r14), %ymm12
000000000035e55d	vaddps	%ymm3, %ymm12, %ymm3
000000000035e561	vmulps	%ymm3, %ymm1, %ymm1
000000000035e565	vmovups	0xe0(%r14), %ymm3
000000000035e56e	vmovaps	%ymm3, 0x20(%rsp)
000000000035e574	vsubps	%ymm3, %ymm2, %ymm2
000000000035e578	vaddps	%ymm2, %ymm0, %ymm0
000000000035e57c	vaddps	%ymm1, %ymm0, %ymm0
000000000035e580	vmulps	%ymm0, %ymm6, %ymm0
000000000035e584	vmovups	0x220(%r14), %ymm8
000000000035e58d	vmaxps	%ymm8, %ymm0, %ymm0
000000000035e592	vroundps	$0x9, %ymm0, %ymm1
000000000035e598	vsubps	%ymm1, %ymm0, %ymm9
000000000035e59c	vmovups	0x240(%r14), %ymm6
000000000035e5a5	vmulps	%ymm6, %ymm9, %ymm0
000000000035e5a9	vmovups	0x260(%r14), %ymm10
000000000035e5b2	vaddps	%ymm0, %ymm10, %ymm0
000000000035e5b6	vmulps	%ymm9, %ymm9, %ymm2
000000000035e5bb	vmulps	%ymm0, %ymm2, %ymm2
000000000035e5bf	vmovups	0x280(%r14), %ymm5
000000000035e5c8	vmulps	%ymm5, %ymm9, %ymm0
000000000035e5cc	vmovups	0x2a0(%r14), %ymm4
000000000035e5d5	vaddps	%ymm4, %ymm0, %ymm0
000000000035e5d9	vaddps	%ymm0, %ymm2, %ymm0
000000000035e5dd	vmulps	%ymm0, %ymm9, %ymm2
000000000035e5e1	vmovups	0x2c0(%r14), %ymm3
000000000035e5ea	vaddps	%ymm2, %ymm3, %ymm2
000000000035e5ee	vmulps	%ymm2, %ymm9, %ymm2
000000000035e5f2	vcvttps2dq	%ymm1, %ymm1
000000000035e5f6	vmovdqa	0x2e0(%r14), %xmm9
000000000035e5ff	vpaddd	%xmm1, %xmm9, %xmm0
000000000035e603	vextractf128	$0x1, %ymm1, %xmm1
000000000035e609	vpaddd	%xmm1, %xmm9, %xmm1
000000000035e60d	vpslld	$0x17, %xmm0, %xmm0
000000000035e612	vpslld	$0x17, %xmm1, %xmm1
000000000035e617	vinsertf128	$0x1, %xmm1, %ymm0, %ymm0
000000000035e61d	vaddps	%ymm2, %ymm7, %ymm1
000000000035e621	vmulps	%ymm0, %ymm1, %ymm0
000000000035e625	vshufps	$0x13, %ymm0, %ymm13, %ymm1     ## ymm1 = ymm13[3,0],ymm0[1,0],ymm13[7,4],ymm0[5,4]
000000000035e62a	vshufps	$0x24, %ymm1, %ymm0, %ymm0      ## ymm0 = ymm0[0,1],ymm1[2,0],ymm0[4,5],ymm1[6,4]
000000000035e62f	vmulps	%ymm0, %ymm7, %ymm7
000000000035e633	vshufps	$0x0, %ymm7, %ymm7, %ymm0       ## ymm0 = ymm7[0,0,0,0,4,4,4,4]
000000000035e638	vmulps	%ymm0, %ymm3, %ymm0
000000000035e63c	vmovsldup	%ymm7, %ymm1            ## ymm1 = ymm7[0,0,2,2,4,4,6,6]
000000000035e640	vaddps	%ymm0, %ymm1, %ymm0
000000000035e644	vblendps	$0x88, %ymm0, %ymm11, %ymm0     ## ymm0 = ymm11[0,1,2],ymm0[3],ymm11[4,5,6],ymm0[7]
000000000035e64a	vmovups	0x300(%r14), %ymm11
000000000035e653	vmulps	%ymm0, %ymm11, %ymm13
000000000035e657	vmovups	0x320(%r14), %ymm1
000000000035e660	vmulps	%ymm1, %ymm13, %ymm0
000000000035e664	vmovshdup	%ymm13, %ymm2           ## ymm2 = ymm13[1,1,3,3,5,5,7,7]
000000000035e669	vaddps	%ymm2, %ymm0, %ymm9
000000000035e66d	vcmpeqps	%ymm3, %ymm1, %ymm0
000000000035e672	vandps	%ymm0, %ymm11, %ymm0
000000000035e676	vcmpltps	%ymm0, %ymm1, %ymm0
000000000035e67b	vblendps	$0x11, %ymm9, %ymm13, %ymm2     ## ymm2 = ymm9[0],ymm13[1,2,3],ymm9[4],ymm13[5,6,7]
000000000035e681	vblendvps	%ymm0, %ymm11, %ymm2, %ymm0
000000000035e687	vcmpltps	%ymm4, %ymm0, %ymm2
000000000035e68c	vandps	%ymm5, %ymm2, %ymm2
000000000035e690	vextractf128	$0x1, %ymm0, %xmm4
000000000035e696	vpsrld	$0x17, %xmm4, %xmm4
000000000035e69b	vpsrld	$0x17, %xmm0, %xmm5
000000000035e6a0	vinsertf128	$0x1, %xmm4, %ymm5, %ymm4
000000000035e6a6	vandps	0x2e0(%r14), %ymm0, %ymm0
000000000035e6af	vorps	%ymm0, %ymm11, %ymm0
000000000035e6b3	vcmpltps	%ymm0, %ymm6, %ymm5
000000000035e6b8	vandps	%ymm5, %ymm11, %ymm5
000000000035e6bc	vmulps	%ymm5, %ymm8, %ymm6
000000000035e6c0	vmulps	%ymm0, %ymm6, %ymm6
000000000035e6c4	vsubps	%ymm11, %ymm0, %ymm0
000000000035e6c9	vsubps	%ymm6, %ymm0, %ymm0
000000000035e6cd	vcvtdq2ps	%ymm4, %ymm4
000000000035e6d1	vsubps	%ymm2, %ymm4, %ymm2
000000000035e6d5	vmulps	%ymm0, %ymm12, %ymm4
000000000035e6d9	vaddps	%ymm4, %ymm15, %ymm4
000000000035e6dd	vmulps	%ymm0, %ymm14, %ymm6
000000000035e6e1	vaddps	(%rsp), %ymm6, %ymm6
000000000035e6e6	vmulps	0x40(%rsp), %ymm0, %ymm8
000000000035e6ec	vaddps	0x80(%rsp), %ymm8, %ymm8
000000000035e6f5	vmulps	%ymm0, %ymm0, %ymm12
000000000035e6f9	vmulps	%ymm6, %ymm12, %ymm6
000000000035e6fd	vaddps	%ymm6, %ymm4, %ymm4
000000000035e701	vmulps	%ymm4, %ymm12, %ymm4
000000000035e705	vaddps	%ymm4, %ymm8, %ymm4
000000000035e709	vsubps	%ymm10, %ymm2, %ymm2
000000000035e70e	vmulps	%ymm4, %ymm0, %ymm4
000000000035e712	vaddps	0xa0(%rsp), %ymm4, %ymm4
000000000035e71b	vmulps	%ymm4, %ymm0, %ymm0
000000000035e71f	vaddps	%ymm2, %ymm5, %ymm2
000000000035e723	vaddps	%ymm0, %ymm2, %ymm0
000000000035e727	vmulps	%ymm0, %ymm3, %ymm0
000000000035e72b	vmaxps	0xc0(%rsp), %ymm0, %ymm0
000000000035e734	vroundps	$0x9, %ymm0, %ymm2
000000000035e73a	vsubps	%ymm2, %ymm0, %ymm0
000000000035e73e	vmulps	0xe0(%rsp), %ymm0, %ymm3
000000000035e747	vaddps	0x20(%rsp), %ymm3, %ymm3
000000000035e74d	vmulps	%ymm0, %ymm0, %ymm4
000000000035e751	vmulps	%ymm3, %ymm4, %ymm3
000000000035e755	vmulps	0x100(%rsp), %ymm0, %ymm4
000000000035e75e	vaddps	0x120(%rsp), %ymm4, %ymm4
000000000035e767	vaddps	%ymm3, %ymm4, %ymm3
000000000035e76b	vmulps	%ymm3, %ymm0, %ymm3
000000000035e76f	vaddps	0x60(%rsp), %ymm3, %ymm3
000000000035e775	vcvttps2dq	%ymm2, %ymm2
000000000035e779	vmulps	%ymm3, %ymm0, %ymm0
000000000035e77d	vmovdqa	0x80(%r14), %xmm3
000000000035e786	vpaddd	%xmm2, %xmm3, %xmm4
000000000035e78a	vextractf128	$0x1, %ymm2, %xmm2
000000000035e790	vpaddd	%xmm2, %xmm3, %xmm2
000000000035e794	vaddps	%ymm0, %ymm11, %ymm0
000000000035e798	vpslld	$0x17, %xmm4, %xmm3
000000000035e79d	vpslld	$0x17, %xmm2, %xmm2
000000000035e7a2	vinsertf128	$0x1, %xmm2, %ymm3, %ymm2
000000000035e7a8	vmulps	%ymm2, %ymm0, %ymm0
000000000035e7ac	vmovsldup	%ymm0, %ymm2            ## ymm2 = ymm0[0,0,2,2,4,4,6,6]
000000000035e7b0	vmulps	%ymm2, %ymm1, %ymm1
000000000035e7b4	vaddps	%ymm1, %ymm13, %ymm1
000000000035e7b8	vshufps	$0xff, %ymm1, %ymm1, %ymm1      ## ymm1 = ymm1[3,3,3,3,7,7,7,7]
000000000035e7bd	vrcpps	%ymm1, %ymm2
000000000035e7c1	vmulps	0x360(%r14), %ymm2, %ymm2
000000000035e7ca	vshufpd	$0x5, %ymm13, %ymm13, %ymm3     ## ymm3 = ymm13[1,0,3,2]
000000000035e7d0	vminps	0x380(%r14), %ymm2, %ymm2
000000000035e7d9	vmulps	0x340(%r14), %ymm3, %ymm3
000000000035e7e2	vaddps	%ymm3, %ymm9, %ymm3
000000000035e7e6	vmaxps	0x3a0(%r14), %ymm2, %ymm2
000000000035e7ef	vmulps	%ymm1, %ymm2, %ymm4
000000000035e7f3	vmovups	0x3c0(%r14), %ymm5
000000000035e7fc	vsubps	%ymm4, %ymm5, %ymm4
000000000035e800	vmulps	%ymm4, %ymm2, %ymm2
000000000035e804	vmulps	%ymm2, %ymm3, %ymm2
000000000035e808	vmovaps	0x140(%rsp), %ymm3
000000000035e811	vcmpltps	%ymm1, %ymm3, %ymm1
000000000035e816	vblendvps	%ymm1, %ymm2, %ymm11, %ymm1
000000000035e81c	vblendps	$0xcc, %ymm0, %ymm7, %ymm0      ## ymm0 = ymm7[0,1],ymm0[2,3],ymm7[4,5],ymm0[6,7]
000000000035e822	vshufps	$0x0, %ymm1, %ymm1, %ymm1       ## ymm1 = ymm1[0,0,0,0,4,4,4,4]
000000000035e827	vmulps	%ymm1, %ymm0, %ymm0
000000000035e82b	vmulps	0x3e0(%r14), %ymm0, %ymm0
000000000035e834	vblendps	$0x88, %ymm7, %ymm0, %ymm0      ## ymm0 = ymm0[0,1,2],ymm7[3],ymm0[4,5,6],ymm7[7]
000000000035e83a	vmovups	%ymm0, -0x10(%r8,%rbx)
000000000035e841	addq	$0x20, %rbx
000000000035e845	movl	%r11d, %r14d
000000000035e848	addl	$-0x2, %r11d
000000000035e84c	addl	%ecx, %r14d
000000000035e84f	addl	$-0x2, %r14d
000000000035e853	cmpl	$0x1, %r14d
000000000035e857	jg	0x35e3f0
000000000035e85d	negl	%r11d
000000000035e860	cmpl	%ecx, %r11d
000000000035e863	jge	0x35e3c0
000000000035e869	movl	%r11d, %r11d
000000000035e86c	shlq	$0x4, %r11
000000000035e870	vmovaps	(%r9,%r11), %xmm0
000000000035e876	movq	0x198(%rdi), %rbx
000000000035e87d	vmovaps	(%rbx), %xmm1
000000000035e881	vmovaps	%xmm1, 0x140(%rsp)
000000000035e88a	vmovaps	0x40(%rbx), %xmm5
000000000035e88f	vmovaps	0x60(%rbx), %xmm10
000000000035e894	vmaxps	%xmm1, %xmm0, %xmm14
000000000035e898	vmulps	0x20(%rbx), %xmm14, %xmm13
000000000035e89d	vcmpeqps	%xmm1, %xmm5, %xmm0
000000000035e8a2	vmovaps	%xmm5, 0x40(%rsp)
000000000035e8a8	vandps	%xmm0, %xmm10, %xmm0
000000000035e8ac	vcmpnleps	%xmm1, %xmm0, %xmm0
000000000035e8b1	vblendvps	%xmm0, %xmm10, %xmm13, %xmm0
000000000035e8b7	vmovaps	0x80(%rbx), %xmm1
000000000035e8bf	vmovaps	%xmm1, 0x120(%rsp)
000000000035e8c8	vandps	%xmm0, %xmm1, %xmm1
000000000035e8cc	vorps	%xmm1, %xmm10, %xmm1
000000000035e8d0	vmovaps	0xa0(%rbx), %xmm2
000000000035e8d8	vmovaps	%xmm2, 0x100(%rsp)
000000000035e8e1	vcmpltps	%xmm2, %xmm0, %xmm2
000000000035e8e6	vmovaps	0xc0(%rbx), %xmm3
000000000035e8ee	vmovaps	%xmm3, 0xe0(%rsp)
000000000035e8f7	vandps	%xmm3, %xmm2, %xmm2
000000000035e8fb	vpsrld	$0x17, %xmm0, %xmm0
000000000035e900	vcvtdq2ps	%xmm0, %xmm0
000000000035e904	vsubps	%xmm2, %xmm0, %xmm0
000000000035e908	vmovaps	0xe0(%rbx), %xmm2
000000000035e910	vmovaps	%xmm2, 0xc0(%rsp)
000000000035e919	vsubps	%xmm2, %xmm0, %xmm0
000000000035e91d	vmovaps	0x100(%rbx), %xmm2
000000000035e925	vmovaps	%xmm2, 0xa0(%rsp)
000000000035e92e	vcmpltps	%xmm1, %xmm2, %xmm2
000000000035e933	vandps	%xmm2, %xmm10, %xmm2
000000000035e937	vaddps	%xmm2, %xmm0, %xmm0
000000000035e93b	vmovaps	0x120(%rbx), %xmm3
000000000035e943	vmovaps	%xmm3, 0x80(%rsp)
000000000035e94c	vmulps	%xmm2, %xmm3, %xmm2
000000000035e950	vmulps	%xmm1, %xmm2, %xmm2
000000000035e954	vsubps	%xmm10, %xmm1, %xmm1
000000000035e959	vsubps	%xmm2, %xmm1, %xmm1
000000000035e95d	vmovaps	0x140(%rbx), %xmm2
000000000035e965	vmovaps	%xmm2, 0x60(%rsp)
000000000035e96b	vmulps	%xmm1, %xmm2, %xmm2
000000000035e96f	vmovaps	0x160(%rbx), %xmm3
000000000035e977	vmovaps	%xmm3, 0x20(%rsp)
000000000035e97d	vaddps	%xmm2, %xmm3, %xmm2
000000000035e981	vmovaps	0x180(%rbx), %xmm3
000000000035e989	vmovaps	%xmm3, (%rsp)
000000000035e98e	vmulps	%xmm1, %xmm3, %xmm3
000000000035e992	vmovaps	0x1a0(%rbx), %xmm4
000000000035e99a	vmovaps	%xmm4, 0x170(%rsp)
000000000035e9a3	vaddps	%xmm3, %xmm4, %xmm3
000000000035e9a7	vmulps	%xmm1, %xmm1, %xmm4
000000000035e9ab	vmulps	%xmm3, %xmm4, %xmm3
000000000035e9af	vaddps	%xmm3, %xmm2, %xmm2
000000000035e9b3	vmulps	%xmm2, %xmm4, %xmm2
000000000035e9b7	vmovaps	0x1c0(%rbx), %xmm3
000000000035e9bf	vmovaps	%xmm3, 0x160(%rsp)
000000000035e9c8	vmulps	%xmm1, %xmm3, %xmm3
000000000035e9cc	vmovaps	0x1e0(%rbx), %xmm11
000000000035e9d4	vaddps	%xmm3, %xmm11, %xmm3
000000000035e9d8	vaddps	%xmm2, %xmm3, %xmm2
000000000035e9dc	vmulps	%xmm2, %xmm1, %xmm2
000000000035e9e0	vmovaps	0x200(%rbx), %xmm9
000000000035e9e8	vaddps	%xmm2, %xmm9, %xmm2
000000000035e9ec	vmulps	%xmm2, %xmm1, %xmm1
000000000035e9f0	vaddps	%xmm1, %xmm0, %xmm0
000000000035e9f4	vmulps	%xmm0, %xmm5, %xmm0
000000000035e9f8	vmovaps	0x220(%rbx), %xmm8
000000000035ea00	vmaxps	%xmm8, %xmm0, %xmm0
000000000035ea05	vroundps	$0x9, %xmm0, %xmm1
000000000035ea0b	vsubps	%xmm1, %xmm0, %xmm7
000000000035ea0f	vmovaps	0x240(%rbx), %xmm6
000000000035ea17	vmulps	%xmm6, %xmm7, %xmm0
000000000035ea1b	vmovaps	0x260(%rbx), %xmm5
000000000035ea23	vaddps	%xmm5, %xmm0, %xmm0
000000000035ea27	vmulps	%xmm7, %xmm7, %xmm2
000000000035ea2b	vmulps	%xmm0, %xmm2, %xmm2
000000000035ea2f	vmovaps	0x280(%rbx), %xmm4
000000000035ea37	vmulps	%xmm4, %xmm7, %xmm0
000000000035ea3b	vmovaps	0x2a0(%rbx), %xmm3
000000000035ea43	vaddps	%xmm3, %xmm0, %xmm0
000000000035ea47	vaddps	%xmm0, %xmm2, %xmm0
000000000035ea4b	vmulps	%xmm0, %xmm7, %xmm2
000000000035ea4f	vmovaps	0x2c0(%rbx), %xmm0
000000000035ea57	vaddps	%xmm2, %xmm0, %xmm2
000000000035ea5b	vmulps	%xmm2, %xmm7, %xmm2
000000000035ea5f	vaddps	%xmm2, %xmm10, %xmm2
000000000035ea63	vcvttps2dq	%xmm1, %xmm1
000000000035ea67	vmovdqa	0x2e0(%rbx), %xmm7
000000000035ea6f	vpaddd	%xmm1, %xmm7, %xmm1
000000000035ea73	vpslld	$0x17, %xmm1, %xmm1
000000000035ea78	vmulps	%xmm1, %xmm2, %xmm1
000000000035ea7c	vblendps	$0x3, %xmm1, %xmm14, %xmm1      ## xmm1 = xmm1[0,1],xmm14[2,3]
000000000035ea82	vshufps	$0xd4, %xmm1, %xmm1, %xmm1      ## xmm1 = xmm1[0,1,1,3]
000000000035ea87	vmulps	%xmm1, %xmm10, %xmm10
000000000035ea8b	vshufps	$0x0, %xmm10, %xmm10, %xmm1     ## xmm1 = xmm10[0,0,0,0]
000000000035ea91	vmulps	%xmm1, %xmm0, %xmm1
000000000035ea95	vmovsldup	%xmm10, %xmm2           ## xmm2 = xmm10[0,0,2,2]
000000000035ea9a	vaddps	%xmm1, %xmm2, %xmm1
000000000035ea9e	vblendps	$0x8, %xmm1, %xmm13, %xmm1      ## xmm1 = xmm13[0,1,2],xmm1[3]
000000000035eaa4	vmovaps	0x300(%rbx), %xmm13
000000000035eaac	vmulps	%xmm1, %xmm13, %xmm14
000000000035eab0	vmovaps	0x320(%rbx), %xmm1
000000000035eab8	vmulps	%xmm1, %xmm14, %xmm2
000000000035eabc	vmovshdup	%xmm14, %xmm12          ## xmm12 = xmm14[1,1,3,3]
000000000035eac1	vaddps	%xmm2, %xmm12, %xmm2
000000000035eac5	vcmpeqps	%xmm0, %xmm1, %xmm12
000000000035eaca	vandps	%xmm13, %xmm12, %xmm12
000000000035eacf	vcmpnleps	%xmm1, %xmm12, %xmm12
000000000035ead4	vblendps	$0x1, %xmm2, %xmm14, %xmm15     ## xmm15 = xmm2[0],xmm14[1,2,3]
000000000035eada	vblendvps	%xmm12, %xmm13, %xmm15, %xmm12
000000000035eae0	vcmpltps	%xmm3, %xmm12, %xmm3
000000000035eae5	vandps	%xmm4, %xmm3, %xmm3
000000000035eae9	vpand	%xmm7, %xmm12, %xmm4
000000000035eaed	vpsrld	$0x17, %xmm12, %xmm7
000000000035eaf3	vcvtdq2ps	%xmm7, %xmm7
000000000035eaf7	vsubps	%xmm3, %xmm7, %xmm3
000000000035eafb	vsubps	%xmm5, %xmm3, %xmm3
000000000035eaff	vpor	%xmm4, %xmm13, %xmm4
000000000035eb03	vcmpltps	%xmm4, %xmm6, %xmm5
000000000035eb08	vandps	%xmm5, %xmm13, %xmm5
000000000035eb0c	vaddps	%xmm5, %xmm3, %xmm3
000000000035eb10	vmulps	%xmm5, %xmm8, %xmm5
000000000035eb14	vmulps	%xmm4, %xmm5, %xmm5
000000000035eb18	vsubps	%xmm13, %xmm4, %xmm4
000000000035eb1d	vsubps	%xmm5, %xmm4, %xmm4
000000000035eb21	vmulps	%xmm4, %xmm9, %xmm5
000000000035eb25	vaddps	%xmm5, %xmm11, %xmm5
000000000035eb29	vmulps	0x160(%rsp), %xmm4, %xmm6
000000000035eb32	vaddps	0x170(%rsp), %xmm6, %xmm6
000000000035eb3b	vmulps	(%rsp), %xmm4, %xmm7
000000000035eb40	vaddps	0x20(%rsp), %xmm7, %xmm7
000000000035eb46	vmulps	%xmm4, %xmm4, %xmm8
000000000035eb4a	vmulps	%xmm6, %xmm8, %xmm6
000000000035eb4e	vaddps	%xmm6, %xmm5, %xmm5
000000000035eb52	vmulps	%xmm5, %xmm8, %xmm5
000000000035eb56	vaddps	%xmm5, %xmm7, %xmm5
000000000035eb5a	vmulps	%xmm5, %xmm4, %xmm5
000000000035eb5e	vaddps	0x60(%rsp), %xmm5, %xmm5
000000000035eb64	vmulps	%xmm5, %xmm4, %xmm4
000000000035eb68	vaddps	%xmm4, %xmm3, %xmm3
000000000035eb6c	vmulps	%xmm3, %xmm0, %xmm0
000000000035eb70	vmaxps	0x80(%rsp), %xmm0, %xmm0
000000000035eb79	vroundps	$0x9, %xmm0, %xmm3
000000000035eb7f	vsubps	%xmm3, %xmm0, %xmm0
000000000035eb83	vmulps	0xa0(%rsp), %xmm0, %xmm4
000000000035eb8c	vaddps	0xc0(%rsp), %xmm4, %xmm4
000000000035eb95	vmulps	%xmm0, %xmm0, %xmm5
000000000035eb99	vmulps	%xmm4, %xmm5, %xmm4
000000000035eb9d	vmulps	0xe0(%rsp), %xmm0, %xmm5
000000000035eba6	vaddps	0x100(%rsp), %xmm5, %xmm5
000000000035ebaf	vaddps	%xmm4, %xmm5, %xmm4
000000000035ebb3	vmulps	%xmm4, %xmm0, %xmm4
000000000035ebb7	vaddps	0x40(%rsp), %xmm4, %xmm4
000000000035ebbd	vmulps	%xmm4, %xmm0, %xmm0
000000000035ebc1	vaddps	%xmm0, %xmm13, %xmm0
000000000035ebc5	vcvttps2dq	%xmm3, %xmm3
000000000035ebc9	vpaddd	0x120(%rsp), %xmm3, %xmm3
000000000035ebd2	vpslld	$0x17, %xmm3, %xmm3
000000000035ebd7	vmulps	%xmm3, %xmm0, %xmm0
000000000035ebdb	vmovsldup	%xmm0, %xmm3            ## xmm3 = xmm0[0,0,2,2]
000000000035ebdf	vmulps	%xmm3, %xmm1, %xmm1
000000000035ebe3	vaddps	%xmm1, %xmm14, %xmm1
000000000035ebe7	vshufpd	$0x1, %xmm14, %xmm14, %xmm3     ## xmm3 = xmm14[1,0]
000000000035ebed	vmulps	0x340(%rbx), %xmm3, %xmm3
000000000035ebf5	vaddps	%xmm2, %xmm3, %xmm2
000000000035ebf9	vshufps	$0xff, %xmm1, %xmm1, %xmm1      ## xmm1 = xmm1[3,3,3,3]
000000000035ebfe	vrcpps	%xmm1, %xmm3
000000000035ec02	vmulps	0x360(%rbx), %xmm3, %xmm3
000000000035ec0a	vminps	0x380(%rbx), %xmm3, %xmm3
000000000035ec12	vmaxps	0x3a0(%rbx), %xmm3, %xmm3
000000000035ec1a	vmulps	%xmm1, %xmm3, %xmm4
000000000035ec1e	vmovaps	0x3c0(%rbx), %xmm5
000000000035ec26	vsubps	%xmm4, %xmm5, %xmm4
000000000035ec2a	vmulps	%xmm4, %xmm3, %xmm3
000000000035ec2e	vmulps	%xmm3, %xmm2, %xmm2
000000000035ec32	vcmpnless	0x140(%rsp), %xmm1, %xmm1
000000000035ec3c	vblendvps	%xmm1, %xmm2, %xmm13, %xmm1
000000000035ec42	vblendps	$0x3, %xmm10, %xmm0, %xmm0      ## xmm0 = xmm10[0,1],xmm0[2,3]
000000000035ec48	vshufps	$0x0, %xmm1, %xmm1, %xmm1       ## xmm1 = xmm1[0,0,0,0]
000000000035ec4d	vmulps	%xmm1, %xmm0, %xmm0
000000000035ec51	vmulps	0x3e0(%rbx), %xmm0, %xmm0
000000000035ec59	vblendps	$0x8, %xmm10, %xmm0, %xmm0      ## xmm0 = xmm0[0,1,2],xmm10[3]
000000000035ec5f	vmovaps	%xmm0, (%r8,%r11)
000000000035ec65	jmp	0x35e3c0
000000000035ec6a	leaq	-0x10(%rbp), %rsp
000000000035ec6e	popq	%rbx
000000000035ec6f	popq	%r14
000000000035ec71	popq	%rbp
000000000035ec72	vzeroupper
000000000035ec75	xorl	%eax, %eax
000000000035ec77	retq
000000000035ec78	nopl	(%rax,%rax)
