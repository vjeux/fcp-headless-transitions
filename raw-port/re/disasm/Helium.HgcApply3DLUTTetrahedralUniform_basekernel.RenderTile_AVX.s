__ZN42HgcApply3DLUTTetrahedralUniform_basekernel14RenderTile_AVXEP6HGTile:
0000000000399420	vbroadcastf128	(%rsi), %ymm0           ## ymm0 = mem[0,1,0,1]
0000000000399425	vshufps	$0xee, %xmm0, %xmm0, %xmm1      ## xmm1 = xmm0[2,3,2,3]
000000000039942a	vpsubd	%xmm0, %xmm1, %xmm1
000000000039942e	vpextrd	$0x1, %xmm1, %r11d
0000000000399434	testl	%r11d, %r11d
0000000000399437	jle	0x399f55
000000000039943d	pushq	%rbp
000000000039943e	movq	%rsp, %rbp
0000000000399441	pushq	%r15
0000000000399443	pushq	%r14
0000000000399445	pushq	%r13
0000000000399447	pushq	%r12
0000000000399449	pushq	%rbx
000000000039944a	andq	$-0x20, %rsp
000000000039944e	subq	$0x180, %rsp                    ## imm = 0x180
0000000000399455	vcvtdq2ps	%ymm0, %ymm0
0000000000399459	vmulps	0x4fb65f(%rip), %ymm0, %ymm0
0000000000399461	vaddps	0x4fb677(%rip), %ymm0, %ymm6
0000000000399469	vmovd	%xmm1, %ecx
000000000039946d	movslq	0x18(%rsi), %rax
0000000000399471	movq	0x10(%rsi), %r8
0000000000399475	movq	0x50(%rsi), %r9
0000000000399479	movslq	0x58(%rsi), %rdx
000000000039947d	shlq	$0x4, %rax
0000000000399481	movq	%rax, 0x38(%rsp)
0000000000399486	shlq	$0x4, %rdx
000000000039948a	movq	%rdx, 0x30(%rsp)
000000000039948f	xorl	%eax, %eax
0000000000399491	vmovaps	0x4fb667(%rip), %ymm7
0000000000399499	vmovaps	%ymm6, 0x40(%rsp)
000000000039949f	movq	%rcx, 0x8(%rsp)
00000000003994a4	movl	%r11d, 0x4(%rsp)
00000000003994a9	jmp	0x3994c5
00000000003994ab	nopl	(%rax,%rax)
00000000003994b0	addq	0x30(%rsp), %r9
00000000003994b5	addq	0x38(%rsp), %r8
00000000003994ba	incl	%eax
00000000003994bc	cmpl	%r11d, %eax
00000000003994bf	je	0x399f47
00000000003994c5	movl	$0x0, %ebx
00000000003994ca	cmpl	$0x2, %ecx
00000000003994cd	movl	%eax, (%rsp)
00000000003994d0	jl	0x399aa2
00000000003994d6	movl	$0x10, %r14d
00000000003994dc	xorl	%ebx, %ebx
00000000003994de	nop
00000000003994e0	movq	0x198(%rdi), %r15
00000000003994e7	vmovups	-0x10(%r9,%r14), %ymm2
00000000003994ee	vmovaps	%ymm2, 0x120(%rsp)
00000000003994f7	vbroadcastss	(%r15), %ymm0
00000000003994fc	vbroadcastss	0x4(%r15), %ymm1
0000000000399502	vmulps	%ymm0, %ymm2, %ymm0
0000000000399506	vbroadcastss	0x24(%r15), %ymm2
000000000039950c	vaddps	%ymm1, %ymm0, %ymm0
0000000000399510	vmovups	0x60(%r15), %ymm5
0000000000399516	vmovups	0x80(%r15), %ymm3
000000000039951f	vmovaps	%ymm3, 0x100(%rsp)
0000000000399528	vsubps	%ymm5, %ymm2, %ymm1
000000000039952c	vmovaps	%ymm5, 0xe0(%rsp)
0000000000399535	vmovups	0x20(%r15), %ymm2
000000000039953b	vmulps	%ymm1, %ymm0, %ymm0
000000000039953f	vmaxps	%ymm3, %ymm0, %ymm0
0000000000399543	vminps	%ymm1, %ymm0, %ymm0
0000000000399547	vroundps	$0x9, %ymm0, %ymm3
000000000039954d	vdpps	$0x3f, %ymm2, %ymm3, %ymm4
0000000000399553	vaddps	%ymm3, %ymm5, %ymm5
0000000000399557	vminps	%ymm1, %ymm5, %ymm1
000000000039955b	vsubps	%ymm3, %ymm1, %ymm1
000000000039955f	vshufps	$0x2, %ymm4, %ymm3, %ymm5       ## ymm5 = ymm3[2,0],ymm4[0,0],ymm3[6,4],ymm4[4,4]
0000000000399564	vmulps	%ymm2, %ymm1, %ymm10
0000000000399568	vshufps	$0xe2, %ymm4, %ymm5, %ymm1      ## ymm1 = ymm5[2,0],ymm4[2,3],ymm5[6,4],ymm4[6,7]
000000000039956d	vaddps	0xa0(%r15), %ymm1, %ymm8
0000000000399576	vsubps	%ymm3, %ymm0, %ymm15
000000000039957a	vsubps	%ymm6, %ymm8, %ymm0
000000000039957e	vaddps	%ymm7, %ymm0, %ymm0
0000000000399582	vaddps	%ymm8, %ymm10, %ymm1
0000000000399587	vroundps	$0x1, %ymm0, %ymm2
000000000039958d	vblendps	$0x11, %ymm1, %ymm8, %ymm0      ## ymm0 = ymm1[0],ymm8[1,2,3],ymm1[4],ymm8[5,6,7]
0000000000399593	vsubps	%ymm6, %ymm0, %ymm1
0000000000399597	vaddps	%ymm7, %ymm1, %ymm1
000000000039959b	vcvtps2dq	%ymm2, %ymm3
000000000039959f	vroundps	$0x1, %ymm1, %ymm1
00000000003995a5	vcvtps2dq	%ymm1, %ymm1
00000000003995a9	vextractf128	$0x1, %ymm3, %xmm5
00000000003995af	vextractf128	$0x1, %ymm1, %xmm4
00000000003995b5	vinsertps	$0x4c, %xmm3, %xmm5, %xmm2 ## xmm2 = xmm3[1],xmm5[1],zero,zero
00000000003995bb	vbroadcastss	0x68(%rsi), %xmm11
00000000003995c1	vunpcklps	%xmm5, %xmm3, %xmm3     ## xmm3 = xmm3[0],xmm5[0],xmm3[1],xmm5[1]
00000000003995c5	vunpcklps	%xmm4, %xmm1, %xmm5     ## xmm5 = xmm1[0],xmm4[0],xmm1[1],xmm4[1]
00000000003995c9	vmovshdup	%ymm10, %ymm12          ## ymm12 = ymm10[1,1,3,3,5,5,7,7]
00000000003995ce	vaddps	%ymm0, %ymm12, %ymm0
00000000003995d2	vblendps	$0x11, %ymm0, %ymm8, %ymm9      ## ymm9 = ymm0[0],ymm8[1,2,3],ymm0[4],ymm8[5,6,7]
00000000003995d8	vunpcklpd	%xmm1, %xmm4, %xmm1     ## xmm1 = xmm4[0],xmm1[0]
00000000003995dc	vsubps	%ymm6, %ymm9, %ymm4
00000000003995e0	vaddps	%ymm7, %ymm4, %ymm4
00000000003995e4	vroundps	$0x1, %ymm4, %ymm4
00000000003995ea	vblendpd	$0x1, %xmm2, %xmm5, %xmm2       ## xmm2 = xmm2[0],xmm5[1]
00000000003995f0	vcvtps2dq	%ymm4, %ymm4
00000000003995f4	vsubps	%ymm10, %ymm0, %ymm0
00000000003995f9	vblendps	$0x11, %ymm0, %ymm8, %ymm0      ## ymm0 = ymm0[0],ymm8[1,2,3],ymm0[4],ymm8[5,6,7]
00000000003995ff	vshufps	$0x24, %xmm1, %xmm3, %xmm3      ## xmm3 = xmm3[0,1],xmm1[2,0]
0000000000399604	vsubps	%ymm6, %ymm0, %ymm1
0000000000399608	vaddps	%ymm7, %ymm1, %ymm1
000000000039960c	vroundps	$0x1, %ymm1, %ymm1
0000000000399612	vpmulld	%xmm11, %xmm2, %xmm2
0000000000399617	vcvtps2dq	%ymm1, %ymm5
000000000039961b	vextractf128	$0x1, %ymm4, %xmm9
0000000000399621	vinsertps	$0x4c, %xmm4, %xmm9, %xmm1 ## xmm1 = xmm4[1],xmm9[1],zero,zero
0000000000399627	vpaddd	%xmm3, %xmm2, %xmm14
000000000039962b	vextractf128	$0x1, %ymm5, %xmm2
0000000000399631	vunpcklps	%xmm2, %xmm5, %xmm13    ## xmm13 = xmm5[0],xmm2[0],xmm5[1],xmm2[1]
0000000000399635	vunpcklps	%xmm9, %xmm4, %xmm3     ## xmm3 = xmm4[0],xmm9[0],xmm4[1],xmm9[1]
000000000039963a	vunpcklpd	%xmm5, %xmm2, %xmm4     ## xmm4 = xmm2[0],xmm5[0]
000000000039963e	vshufps	$0xaa, %ymm10, %ymm10, %ymm2    ## ymm2 = ymm10[2,2,2,2,6,6,6,6]
0000000000399644	vaddps	%ymm2, %ymm8, %ymm2
0000000000399648	vblendps	$0x22, %ymm2, %ymm0, %ymm2      ## ymm2 = ymm0[0],ymm2[1],ymm0[2,3,4],ymm2[5],ymm0[6,7]
000000000039964e	vblendpd	$0x1, %xmm1, %xmm13, %xmm5      ## xmm5 = xmm1[0],xmm13[1]
0000000000399654	vsubps	%ymm6, %ymm2, %ymm0
0000000000399658	vaddps	%ymm7, %ymm0, %ymm0
000000000039965c	vroundps	$0x1, %ymm0, %ymm0
0000000000399662	vshufps	$0x24, %xmm4, %xmm3, %xmm3      ## xmm3 = xmm3[0,1],xmm4[2,0]
0000000000399667	vcvtps2dq	%ymm0, %ymm1
000000000039966b	vsubps	%ymm12, %ymm2, %ymm0
0000000000399670	vblendps	$0x11, %ymm0, %ymm2, %ymm4      ## ymm4 = ymm0[0],ymm2[1,2,3],ymm0[4],ymm2[5,6,7]
0000000000399676	vpmulld	%xmm11, %xmm5, %xmm5
000000000039967b	vsubps	%ymm6, %ymm4, %ymm4
000000000039967f	vaddps	%ymm7, %ymm4, %ymm4
0000000000399683	vroundps	$0x1, %ymm4, %ymm4
0000000000399689	vpaddd	%xmm3, %xmm5, %xmm9
000000000039968d	vcvtps2dq	%ymm4, %ymm3
0000000000399691	vextractf128	$0x1, %ymm3, %xmm4
0000000000399697	vextractf128	$0x1, %ymm1, %xmm5
000000000039969d	vunpcklps	%xmm4, %xmm3, %xmm8     ## xmm8 = xmm3[0],xmm4[0],xmm3[1],xmm4[1]
00000000003996a1	vinsertps	$0x4c, %xmm1, %xmm5, %xmm13 ## xmm13 = xmm1[1],xmm5[1],zero,zero
00000000003996a7	vblendpd	$0x1, %xmm13, %xmm8, %xmm13     ## xmm13 = xmm13[0],xmm8[1]
00000000003996ad	movq	0x60(%rsi), %r12
00000000003996b1	vmovdqa	%xmm14, 0x20(%rsp)
00000000003996b7	vmovd	%xmm14, %eax
00000000003996bb	cltq
00000000003996bd	shlq	$0x4, %rax
00000000003996c1	vunpcklpd	%xmm3, %xmm4, %xmm3     ## xmm3 = xmm4[0],xmm3[0]
00000000003996c5	vmovaps	(%r12,%rax), %xmm4
00000000003996cb	vpextrd	$0x1, %xmm14, %eax
00000000003996d1	cltq
00000000003996d3	shlq	$0x4, %rax
00000000003996d7	vmovdqa	%xmm9, 0x10(%rsp)
00000000003996dd	vpextrd	$0x2, %xmm9, %edx
00000000003996e3	vinsertf128	$0x1, (%r12,%rax), %ymm4, %ymm8
00000000003996ea	movslq	%edx, %rax
00000000003996ed	vpextrd	$0x3, %xmm9, %edx
00000000003996f3	shlq	$0x4, %rax
00000000003996f7	movslq	%edx, %rdx
00000000003996fa	shlq	$0x4, %rdx
00000000003996fe	vunpcklps	%xmm5, %xmm1, %xmm4     ## xmm4 = xmm1[0],xmm5[0],xmm1[1],xmm5[1]
0000000000399702	vmovaps	(%r12,%rax), %xmm1
0000000000399708	vpmulld	%xmm11, %xmm13, %xmm5
000000000039970d	vshufps	$0x24, %xmm3, %xmm4, %xmm3      ## xmm3 = xmm4[0,1],xmm3[2,0]
0000000000399712	vpaddd	%xmm3, %xmm5, %xmm3
0000000000399716	vmovd	%xmm3, %r11d
000000000039971b	vpextrd	$0x1, %xmm3, %r10d
0000000000399721	vpextrd	$0x2, %xmm3, %r13d
0000000000399727	vaddps	%ymm0, %ymm10, %ymm0
000000000039972b	vblendps	$0x11, %ymm0, %ymm2, %ymm4      ## ymm4 = ymm0[0],ymm2[1,2,3],ymm0[4],ymm2[5,6,7]
0000000000399731	vpextrd	$0x3, %xmm3, %eax
0000000000399737	vsubps	%ymm6, %ymm4, %ymm3
000000000039973b	vaddps	%ymm7, %ymm3, %ymm3
000000000039973f	vroundps	$0x1, %ymm3, %ymm3
0000000000399745	movslq	%r11d, %r11
0000000000399748	vcvtps2dq	%ymm3, %ymm3
000000000039974c	vaddps	%ymm0, %ymm12, %ymm0
0000000000399750	vblendps	$0x11, %ymm0, %ymm2, %ymm0      ## ymm0 = ymm0[0],ymm2[1,2,3],ymm0[4],ymm2[5,6,7]
0000000000399756	shlq	$0x4, %r11
000000000039975a	vsubps	%ymm6, %ymm0, %ymm0
000000000039975e	vaddps	%ymm7, %ymm0, %ymm0
0000000000399762	vroundps	$0x1, %ymm0, %ymm0
0000000000399768	movslq	%r10d, %rcx
000000000039976b	vcvtps2dq	%ymm0, %ymm0
000000000039976f	vextractf128	$0x1, %ymm3, %xmm2
0000000000399775	vinsertps	$0x4c, %xmm3, %xmm2, %xmm4 ## xmm4 = xmm3[1],xmm2[1],zero,zero
000000000039977b	vmovaps	(%r12,%r11), %xmm5
0000000000399781	vextractf128	$0x1, %ymm0, %xmm12
0000000000399787	vunpcklps	%xmm12, %xmm0, %xmm10   ## xmm10 = xmm0[0],xmm12[0],xmm0[1],xmm12[1]
000000000039978c	vblendpd	$0x1, %xmm4, %xmm10, %xmm4      ## xmm4 = xmm4[0],xmm10[1]
0000000000399792	shlq	$0x4, %rcx
0000000000399796	vpmulld	%xmm11, %xmm4, %xmm4
000000000039979b	vunpcklps	%xmm2, %xmm3, %xmm2     ## xmm2 = xmm3[0],xmm2[0],xmm3[1],xmm2[1]
000000000039979f	vinsertf128	$0x1, (%r12,%rdx), %ymm1, %ymm3
00000000003997a6	vunpcklpd	%xmm0, %xmm12, %xmm0    ## xmm0 = xmm12[0],xmm0[0]
00000000003997aa	vshufps	$0x24, %xmm0, %xmm2, %xmm0      ## xmm0 = xmm2[0,1],xmm0[2,0]
00000000003997af	vpaddd	%xmm0, %xmm4, %xmm0
00000000003997b3	vmovd	%xmm0, %edx
00000000003997b7	vpextrd	$0x1, %xmm0, %r10d
00000000003997bd	vinsertf128	$0x1, (%r12,%rcx), %ymm5, %ymm14
00000000003997c4	vpextrd	$0x2, %xmm0, %ecx
00000000003997ca	movslq	%ecx, %rcx
00000000003997cd	shlq	$0x4, %rcx
00000000003997d1	vpextrd	$0x3, %xmm0, %r11d
00000000003997d7	movslq	%r11d, %r11
00000000003997da	vmovaps	(%r12,%rcx), %xmm0
00000000003997e0	shlq	$0x4, %r11
00000000003997e4	vmovaps	%ymm15, %ymm7
00000000003997e8	vshufps	$0x68, %ymm15, %ymm15, %ymm1    ## ymm1 = ymm15[0,2,2,1,4,6,6,5]
00000000003997ee	vinsertf128	$0x1, (%r12,%r11), %ymm0, %ymm9
00000000003997f5	vshufps	$0x91, %ymm15, %ymm15, %ymm0    ## ymm0 = ymm15[1,0,1,2,5,4,5,6]
00000000003997fb	vcmpltps	%ymm1, %ymm0, %ymm0
0000000000399800	vmovaps	%ymm3, 0xc0(%rsp)
0000000000399809	vsubps	%ymm8, %ymm3, %ymm2
000000000039980e	vmovaps	%ymm8, 0x60(%rsp)
0000000000399814	vsubps	%ymm14, %ymm9, %ymm1
0000000000399819	vmovaps	%ymm9, 0x80(%rsp)
0000000000399822	vsubps	%ymm3, %ymm14, %ymm4
0000000000399826	vshufps	$0x0, %ymm15, %ymm15, %ymm11    ## ymm11 = ymm15[0,0,0,0,4,4,4,4]
000000000039982c	vshufps	$0x55, %ymm15, %ymm15, %ymm15   ## ymm15 = ymm15[1,1,1,1,5,5,5,5]
0000000000399832	vmulps	%ymm1, %ymm11, %ymm6
0000000000399836	vmulps	%ymm2, %ymm15, %ymm1
000000000039983a	vmovaps	%ymm1, 0xa0(%rsp)
0000000000399843	vshufps	$0xaa, %ymm7, %ymm7, %ymm12     ## ymm12 = ymm7[2,2,2,2,6,6,6,6]
0000000000399848	vmulps	%ymm4, %ymm12, %ymm2
000000000039984c	vaddps	%ymm6, %ymm1, %ymm4
0000000000399850	vaddps	%ymm4, %ymm2, %ymm1
0000000000399854	vmovaps	%ymm1, 0x140(%rsp)
000000000039985d	vmovaps	0xe0(%rsp), %ymm13
0000000000399866	vandps	%ymm0, %ymm13, %ymm3
000000000039986a	vshufps	$0x0, %ymm3, %ymm3, %ymm2       ## ymm2 = ymm3[0,0,0,0,4,4,4,4]
000000000039986f	vshufps	$0x55, %ymm3, %ymm3, %ymm5      ## ymm5 = ymm3[1,1,1,1,5,5,5,5]
0000000000399874	vminps	%ymm5, %ymm2, %ymm4
0000000000399878	movslq	%r13d, %rcx
000000000039987b	cltq
000000000039987d	shlq	$0x4, %rcx
0000000000399881	shlq	$0x4, %rax
0000000000399885	movslq	%edx, %rdx
0000000000399888	shlq	$0x4, %rdx
000000000039988c	movslq	%r10d, %r10
000000000039988f	shlq	$0x4, %r10
0000000000399893	vmovaps	(%r12,%rcx), %xmm2
0000000000399899	vinsertf128	$0x1, (%r12,%rax), %ymm2, %ymm0
00000000003998a0	vmovaps	(%r12,%rdx), %xmm2
00000000003998a6	vinsertf128	$0x1, (%r12,%r10), %ymm2, %ymm10
00000000003998ad	vsubps	%ymm0, %ymm10, %ymm5
00000000003998b1	vmulps	%ymm5, %ymm11, %ymm1
00000000003998b5	vsubps	%ymm10, %ymm9, %ymm5
00000000003998ba	vmulps	%ymm5, %ymm15, %ymm5
00000000003998be	vaddps	%ymm5, %ymm1, %ymm1
00000000003998c2	vsubps	%ymm8, %ymm0, %ymm9
00000000003998c7	vmulps	%ymm9, %ymm12, %ymm9
00000000003998cc	vmovaps	0x100(%rsp), %ymm2
00000000003998d5	vcmpltps	%ymm4, %ymm2, %ymm4
00000000003998da	vaddps	%ymm1, %ymm9, %ymm1
00000000003998de	vmovaps	0x140(%rsp), %ymm8
00000000003998e7	vblendvps	%ymm4, %ymm1, %ymm8, %ymm1
00000000003998ed	vshufps	$0x81, %ymm7, %ymm7, %ymm4      ## ymm4 = ymm7[1,0,0,2,5,4,4,6]
00000000003998f2	vshufps	$0x64, %ymm7, %ymm7, %ymm8      ## ymm8 = ymm7[0,1,2,1,4,5,6,5]
00000000003998f7	vcmpleps	%ymm4, %ymm8, %ymm4
00000000003998fc	vsubps	%ymm0, %ymm14, %ymm0
0000000000399900	vmulps	%ymm0, %ymm15, %ymm0
0000000000399904	vaddps	%ymm6, %ymm0, %ymm0
0000000000399908	vaddps	%ymm0, %ymm9, %ymm0
000000000039990c	vandps	%ymm4, %ymm13, %ymm14
0000000000399910	vshufps	$0x0, %ymm14, %ymm14, %ymm4     ## ymm4 = ymm14[0,0,0,0,4,4,4,4]
0000000000399916	vshufps	$0xaa, %ymm3, %ymm3, %ymm6      ## ymm6 = ymm3[2,2,2,2,6,6,6,6]
000000000039991b	vminps	%ymm6, %ymm4, %ymm4
000000000039991f	vcmpltps	%ymm4, %ymm2, %ymm4
0000000000399924	vblendvps	%ymm4, %ymm0, %ymm1, %ymm4
000000000039992a	vmovaps	0x20(%rsp), %xmm0
0000000000399930	vextractps	$0x2, %xmm0, %eax
0000000000399936	vextractps	$0x3, %xmm0, %ecx
000000000039993c	vmovdqa	0x10(%rsp), %xmm0
0000000000399942	vmovd	%xmm0, %edx
0000000000399946	vpextrd	$0x1, %xmm0, %r10d
000000000039994c	cltq
000000000039994e	shlq	$0x4, %rax
0000000000399952	movslq	%ecx, %rcx
0000000000399955	shlq	$0x4, %rcx
0000000000399959	movslq	%edx, %rdx
000000000039995c	vmovaps	(%r12,%rax), %xmm0
0000000000399962	vinsertf128	$0x1, (%r12,%rcx), %ymm0, %ymm1
0000000000399969	movq	0x8(%rsp), %rcx
000000000039996e	shlq	$0x4, %rdx
0000000000399972	movslq	%r10d, %rax
0000000000399975	shlq	$0x4, %rax
0000000000399979	vmovaps	(%r12,%rdx), %xmm0
000000000039997f	vinsertf128	$0x1, (%r12,%rax), %ymm0, %ymm0
0000000000399986	vsubps	%ymm1, %ymm0, %ymm6
000000000039998a	vmulps	%ymm6, %ymm15, %ymm6
000000000039998e	vshufps	$0xff, %ymm3, %ymm3, %ymm3      ## ymm3 = ymm3[3,3,3,3,7,7,7,7]
0000000000399993	vshufps	$0x55, %ymm14, %ymm14, %ymm8    ## ymm8 = ymm14[1,1,1,1,5,5,5,5]
0000000000399999	vminps	%ymm8, %ymm3, %ymm3
000000000039999e	vmovaps	0x80(%rsp), %ymm8
00000000003999a7	vsubps	%ymm0, %ymm8, %ymm8
00000000003999ab	vmovaps	0x60(%rsp), %ymm15
00000000003999b1	vsubps	%ymm15, %ymm1, %ymm9
00000000003999b6	vmulps	%ymm9, %ymm11, %ymm9
00000000003999bb	vaddps	%ymm6, %ymm9, %ymm6
00000000003999bf	vmulps	%ymm8, %ymm12, %ymm8
00000000003999c4	vaddps	%ymm6, %ymm8, %ymm6
00000000003999c8	vcmpltps	%ymm3, %ymm2, %ymm3
00000000003999cd	vblendvps	%ymm3, %ymm6, %ymm4, %ymm3
00000000003999d3	vmovshdup	%ymm7, %ymm4            ## ymm4 = ymm7[1,1,3,3,5,5,7,7]
00000000003999d7	vcmpltps	%ymm4, %ymm7, %ymm4
00000000003999dc	vandps	%ymm4, %ymm13, %ymm4
00000000003999e0	vsubps	0xc0(%rsp), %ymm0, %ymm0
00000000003999e9	vmulps	%ymm0, %ymm11, %ymm0
00000000003999ed	vmovaps	0x4fb10b(%rip), %ymm7
00000000003999f5	vaddps	0xa0(%rsp), %ymm0, %ymm0
00000000003999fe	vaddps	%ymm0, %ymm8, %ymm0
0000000000399a02	vshufps	$0xaa, %ymm14, %ymm14, %ymm6    ## ymm6 = ymm14[2,2,2,2,6,6,6,6]
0000000000399a08	vshufps	$0x0, %ymm4, %ymm4, %ymm4       ## ymm4 = ymm4[0,0,0,0,4,4,4,4]
0000000000399a0d	vminps	%ymm4, %ymm6, %ymm4
0000000000399a11	vmovaps	%ymm2, %ymm8
0000000000399a15	vcmpltps	%ymm4, %ymm2, %ymm4
0000000000399a1a	vblendvps	%ymm4, %ymm0, %ymm3, %ymm0
0000000000399a20	vsubps	%ymm1, %ymm10, %ymm1
0000000000399a24	vaddps	%ymm5, %ymm9, %ymm2
0000000000399a28	vmulps	%ymm1, %ymm12, %ymm1
0000000000399a2c	vshufps	$0xff, %ymm14, %ymm14, %ymm3    ## ymm3 = ymm14[3,3,3,3,7,7,7,7]
0000000000399a32	vminps	%ymm6, %ymm3, %ymm3
0000000000399a36	vmovaps	0x40(%rsp), %ymm6
0000000000399a3c	vaddps	%ymm2, %ymm1, %ymm1
0000000000399a40	vcmpltps	%ymm3, %ymm8, %ymm2
0000000000399a45	vblendvps	%ymm2, %ymm1, %ymm0, %ymm0
0000000000399a4b	vaddps	%ymm0, %ymm15, %ymm0
0000000000399a4f	vbroadcastss	0x8(%r15), %ymm1
0000000000399a55	vmulps	%ymm0, %ymm1, %ymm0
0000000000399a59	vmovups	0x40(%r15), %ymm1
0000000000399a5f	vcmpltps	%ymm8, %ymm1, %ymm1
0000000000399a65	vbroadcastss	0xc(%r15), %ymm2
0000000000399a6b	vaddps	%ymm0, %ymm2, %ymm0
0000000000399a6f	vblendvps	%ymm1, 0x120(%rsp), %ymm0, %ymm0
0000000000399a7a	vmovups	%ymm0, -0x10(%r8,%r14)
0000000000399a81	addq	$0x20, %r14
0000000000399a85	movl	%ebx, %eax
0000000000399a87	addl	$-0x2, %ebx
0000000000399a8a	addl	%ecx, %eax
0000000000399a8c	addl	$-0x2, %eax
0000000000399a8f	cmpl	$0x1, %eax
0000000000399a92	jg	0x3994e0
0000000000399a98	negl	%ebx
0000000000399a9a	movl	0x4(%rsp), %r11d
0000000000399a9f	movl	(%rsp), %eax
0000000000399aa2	cmpl	%ecx, %ebx
0000000000399aa4	jge	0x3994b0
0000000000399aaa	movl	%ebx, %ebx
0000000000399aac	shlq	$0x4, %rbx
0000000000399ab0	vmovaps	(%r9,%rbx), %xmm1
0000000000399ab6	vmovaps	%xmm1, 0x120(%rsp)
0000000000399abf	movq	0x198(%rdi), %r14
0000000000399ac6	vbroadcastss	(%r14), %xmm0
0000000000399acb	vmulps	%xmm0, %xmm1, %xmm0
0000000000399acf	vbroadcastss	0x4(%r14), %xmm1
0000000000399ad5	vaddps	%xmm1, %xmm0, %xmm0
0000000000399ad9	vbroadcastss	0x24(%r14), %xmm1
0000000000399adf	vmovaps	0x20(%r14), %xmm2
0000000000399ae5	vmovaps	0x60(%r14), %xmm12
0000000000399aeb	vmovaps	0x80(%r14), %xmm3
0000000000399af4	vmovaps	%xmm3, 0x100(%rsp)
0000000000399afd	vsubps	%xmm12, %xmm1, %xmm1
0000000000399b02	vmulps	%xmm1, %xmm0, %xmm0
0000000000399b06	vmaxps	%xmm3, %xmm0, %xmm0
0000000000399b0a	vminps	%xmm1, %xmm0, %xmm0
0000000000399b0e	vroundps	$0x9, %xmm0, %xmm3
0000000000399b14	vsubps	%xmm3, %xmm0, %xmm9
0000000000399b18	vaddps	%xmm3, %xmm12, %xmm0
0000000000399b1c	vminps	%xmm1, %xmm0, %xmm0
0000000000399b20	vdpps	$0x3f, %xmm2, %xmm3, %xmm1
0000000000399b26	vsubps	%xmm3, %xmm0, %xmm0
0000000000399b2a	vinsertps	$0x90, %xmm3, %xmm1, %xmm1 ## xmm1 = xmm1[0],xmm3[2],xmm1[2,3]
0000000000399b30	vaddps	0xa0(%r14), %xmm1, %xmm1
0000000000399b39	vmulps	%xmm2, %xmm0, %xmm13
0000000000399b3d	movl	0x68(%rsi), %r12d
0000000000399b41	vsubps	%xmm6, %xmm1, %xmm0
0000000000399b45	vbroadcastss	0x2e17a(%rip), %xmm7
0000000000399b4e	vaddps	%xmm7, %xmm0, %xmm0
0000000000399b52	vroundps	$0x1, %xmm0, %xmm0
0000000000399b58	vcvtps2dq	%xmm0, %xmm0
0000000000399b5c	movq	0x60(%rsi), %r15
0000000000399b60	vmovd	%xmm0, %eax
0000000000399b64	vpextrd	$0x1, %xmm0, %ecx
0000000000399b6a	imull	%r12d, %ecx
0000000000399b6e	addl	%eax, %ecx
0000000000399b70	movslq	%ecx, %rax
0000000000399b73	shlq	$0x4, %rax
0000000000399b77	vmovaps	(%r15,%rax), %xmm4
0000000000399b7d	vaddss	%xmm13, %xmm1, %xmm0
0000000000399b82	vmovaps	%xmm0, 0xe0(%rsp)
0000000000399b8b	vmovaps	%xmm1, %xmm3
0000000000399b8f	vmovaps	%xmm1, 0x10(%rsp)
0000000000399b95	vmovshdup	%xmm13, %xmm2           ## xmm2 = xmm13[1,1,3,3]
0000000000399b9a	vaddps	%xmm0, %xmm2, %xmm0
0000000000399b9e	vmovaps	%xmm0, 0x20(%rsp)
0000000000399ba4	vsubps	%xmm13, %xmm0, %xmm0
0000000000399ba9	vblendps	$0x1, %xmm0, %xmm1, %xmm0       ## xmm0 = xmm0[0],xmm1[1,2,3]
0000000000399baf	vsubps	%xmm6, %xmm0, %xmm1
0000000000399bb3	vaddps	%xmm7, %xmm1, %xmm1
0000000000399bb7	vroundps	$0x1, %xmm1, %xmm1
0000000000399bbd	vcvtps2dq	%xmm1, %xmm1
0000000000399bc1	vmovd	%xmm1, %eax
0000000000399bc5	vpextrd	$0x1, %xmm1, %ecx
0000000000399bcb	imull	%r12d, %ecx
0000000000399bcf	addl	%eax, %ecx
0000000000399bd1	movslq	%ecx, %rax
0000000000399bd4	shlq	$0x4, %rax
0000000000399bd8	vmovaps	(%r15,%rax), %xmm8
0000000000399bde	vshufps	$0xaa, %xmm13, %xmm13, %xmm1    ## xmm1 = xmm13[2,2,2,2]
0000000000399be4	vaddps	%xmm3, %xmm1, %xmm1
0000000000399be8	vblendps	$0x2, %xmm1, %xmm0, %xmm0       ## xmm0 = xmm0[0],xmm1[1],xmm0[2,3]
0000000000399bee	vsubps	%xmm6, %xmm0, %xmm1
0000000000399bf2	vaddps	%xmm7, %xmm1, %xmm1
0000000000399bf6	vroundps	$0x1, %xmm1, %xmm1
0000000000399bfc	vcvtps2dq	%xmm1, %xmm1
0000000000399c00	vmovd	%xmm1, %eax
0000000000399c04	vpextrd	$0x1, %xmm1, %ecx
0000000000399c0a	imull	%r12d, %ecx
0000000000399c0e	addl	%eax, %ecx
0000000000399c10	movslq	%ecx, %rax
0000000000399c13	shlq	$0x4, %rax
0000000000399c17	vmovaps	(%r15,%rax), %xmm10
0000000000399c1d	vsubps	%xmm2, %xmm0, %xmm1
0000000000399c21	vsubss	%xmm2, %xmm0, %xmm3
0000000000399c25	vsubps	%xmm6, %xmm3, %xmm3
0000000000399c29	vaddps	%xmm7, %xmm3, %xmm3
0000000000399c2d	vroundps	$0x1, %xmm3, %xmm3
0000000000399c33	vcvtps2dq	%xmm3, %xmm3
0000000000399c37	vmovd	%xmm3, %eax
0000000000399c3b	vpextrd	$0x1, %xmm3, %r13d
0000000000399c41	vaddps	%xmm1, %xmm13, %xmm1
0000000000399c45	vblendps	$0x1, %xmm1, %xmm0, %xmm3       ## xmm3 = xmm1[0],xmm0[1,2,3]
0000000000399c4b	vsubps	%xmm6, %xmm3, %xmm3
0000000000399c4f	vaddps	%xmm7, %xmm3, %xmm3
0000000000399c53	vroundps	$0x1, %xmm3, %xmm3
0000000000399c59	vcvtps2dq	%xmm3, %xmm3
0000000000399c5d	vaddps	%xmm1, %xmm2, %xmm1
0000000000399c61	vblendps	$0x1, %xmm1, %xmm0, %xmm0       ## xmm0 = xmm1[0],xmm0[1,2,3]
0000000000399c67	vsubps	%xmm6, %xmm0, %xmm0
0000000000399c6b	vaddps	%xmm7, %xmm0, %xmm0
0000000000399c6f	vroundps	$0x1, %xmm0, %xmm0
0000000000399c75	vcvtps2dq	%xmm0, %xmm0
0000000000399c79	vmovd	%xmm0, %ecx
0000000000399c7d	vpextrd	$0x1, %xmm0, %r10d
0000000000399c83	imull	%r12d, %r10d
0000000000399c87	addl	%ecx, %r10d
0000000000399c8a	vmovd	%xmm3, %edx
0000000000399c8e	movslq	%r10d, %rcx
0000000000399c91	shlq	$0x4, %rcx
0000000000399c95	vmovaps	(%r15,%rcx), %xmm13
0000000000399c9b	vpextrd	$0x1, %xmm3, %r10d
0000000000399ca1	vshufps	$0x68, %xmm9, %xmm9, %xmm0      ## xmm0 = xmm9[0,2,2,1]
0000000000399ca7	vshufps	$0x91, %xmm9, %xmm9, %xmm1      ## xmm1 = xmm9[1,0,1,2]
0000000000399cad	vcmpltps	%xmm0, %xmm1, %xmm2
0000000000399cb2	vmovaps	%xmm10, %xmm1
0000000000399cb6	vmovaps	%xmm10, 0x60(%rsp)
0000000000399cbc	vsubps	%xmm10, %xmm13, %xmm0
0000000000399cc1	vmovaps	%xmm4, %xmm10
0000000000399cc5	vmovaps	%xmm4, 0x80(%rsp)
0000000000399cce	vmovaps	%xmm8, 0xc0(%rsp)
0000000000399cd7	vsubps	%xmm4, %xmm8, %xmm3
0000000000399cdb	vshufps	$0x0, %xmm9, %xmm9, %xmm15      ## xmm15 = xmm9[0,0,0,0]
0000000000399ce1	vmulps	%xmm0, %xmm15, %xmm7
0000000000399ce5	vshufps	$0x55, %xmm9, %xmm9, %xmm6      ## xmm6 = xmm9[1,1,1,1]
0000000000399ceb	vmulps	%xmm3, %xmm6, %xmm0
0000000000399cef	vmovaps	%xmm0, 0xa0(%rsp)
0000000000399cf8	vsubps	%xmm8, %xmm1, %xmm3
0000000000399cfd	vshufps	$0xaa, %xmm9, %xmm9, %xmm14     ## xmm14 = xmm9[2,2,2,2]
0000000000399d03	vmulps	%xmm3, %xmm14, %xmm3
0000000000399d07	vaddps	%xmm7, %xmm0, %xmm4
0000000000399d0b	vaddps	%xmm4, %xmm3, %xmm8
0000000000399d0f	vandps	%xmm2, %xmm12, %xmm2
0000000000399d13	vshufps	$0x0, %xmm2, %xmm2, %xmm4       ## xmm4 = xmm2[0,0,0,0]
0000000000399d18	vshufps	$0x55, %xmm2, %xmm2, %xmm5      ## xmm5 = xmm2[1,1,1,1]
0000000000399d1d	vminps	%xmm5, %xmm4, %xmm3
0000000000399d21	imull	%r12d, %r13d
0000000000399d25	addl	%eax, %r13d
0000000000399d28	movslq	%r13d, %rax
0000000000399d2b	shlq	$0x4, %rax
0000000000399d2f	imull	%r12d, %r10d
0000000000399d33	addl	%edx, %r10d
0000000000399d36	movslq	%r10d, %rcx
0000000000399d39	shlq	$0x4, %rcx
0000000000399d3d	vmovaps	(%r15,%rax), %xmm0
0000000000399d43	vmovaps	(%r15,%rcx), %xmm4
0000000000399d49	vsubps	%xmm0, %xmm4, %xmm5
0000000000399d4d	vmulps	%xmm5, %xmm15, %xmm1
0000000000399d51	vsubps	%xmm4, %xmm13, %xmm5
0000000000399d55	vmulps	%xmm5, %xmm6, %xmm5
0000000000399d59	vaddps	%xmm5, %xmm1, %xmm1
0000000000399d5d	vsubps	%xmm10, %xmm0, %xmm11
0000000000399d62	vmulps	%xmm11, %xmm14, %xmm11
0000000000399d67	vaddps	%xmm1, %xmm11, %xmm1
0000000000399d6b	vmovaps	0x100(%rsp), %xmm10
0000000000399d74	vcmpnleps	%xmm10, %xmm3, %xmm3
0000000000399d7a	vblendvps	%xmm3, %xmm1, %xmm8, %xmm3
0000000000399d80	vshufps	$0x81, %xmm9, %xmm9, %xmm1      ## xmm1 = xmm9[1,0,0,2]
0000000000399d86	vshufps	$0x64, %xmm9, %xmm9, %xmm8      ## xmm8 = xmm9[0,1,2,1]
0000000000399d8c	vcmpleps	%xmm1, %xmm8, %xmm1
0000000000399d91	vmovaps	0x60(%rsp), %xmm8
0000000000399d97	vsubps	%xmm0, %xmm8, %xmm0
0000000000399d9b	vmulps	%xmm0, %xmm6, %xmm0
0000000000399d9f	vaddps	%xmm7, %xmm0, %xmm0
0000000000399da3	vaddps	%xmm0, %xmm11, %xmm0
0000000000399da7	vandps	%xmm1, %xmm12, %xmm1
0000000000399dab	vshufps	$0x0, %xmm1, %xmm1, %xmm7       ## xmm7 = xmm1[0,0,0,0]
0000000000399db0	vshufps	$0xaa, %xmm2, %xmm2, %xmm8      ## xmm8 = xmm2[2,2,2,2]
0000000000399db5	vminps	%xmm8, %xmm7, %xmm7
0000000000399dba	vcmpnleps	%xmm10, %xmm7, %xmm7
0000000000399dc0	vblendvps	%xmm7, %xmm0, %xmm3, %xmm3
0000000000399dc6	vmovaps	0xe0(%rsp), %xmm0
0000000000399dcf	vsubps	0x40(%rsp), %xmm0, %xmm0
0000000000399dd5	vbroadcastss	0x2deea(%rip), %xmm7
0000000000399dde	vaddps	%xmm7, %xmm0, %xmm0
0000000000399de2	vroundps	$0x1, %xmm0, %xmm0
0000000000399de8	vcvtps2dq	%xmm0, %xmm0
0000000000399dec	vmovd	%xmm0, %eax
0000000000399df0	vpextrd	$0x1, %xmm0, %ecx
0000000000399df6	vmovaps	0x10(%rsp), %xmm0
0000000000399dfc	vblendps	$0x1, 0x20(%rsp), %xmm0, %xmm0  ## xmm0 = mem[0],xmm0[1,2,3]
0000000000399e04	vsubps	0x40(%rsp), %xmm0, %xmm0
0000000000399e0a	vaddps	%xmm7, %xmm0, %xmm0
0000000000399e0e	vroundps	$0x1, %xmm0, %xmm0
0000000000399e14	vcvtps2dq	%xmm0, %xmm0
0000000000399e18	vmovd	%xmm0, %edx
0000000000399e1c	vpextrd	$0x1, %xmm0, %r10d
0000000000399e22	imull	%r12d, %ecx
0000000000399e26	addl	%eax, %ecx
0000000000399e28	imull	%r12d, %r10d
0000000000399e2c	movslq	%ecx, %rax
0000000000399e2f	shlq	$0x4, %rax
0000000000399e33	addl	%edx, %r10d
0000000000399e36	movslq	%r10d, %rcx
0000000000399e39	shlq	$0x4, %rcx
0000000000399e3d	vmovaps	(%r15,%rax), %xmm8
0000000000399e43	movl	(%rsp), %eax
0000000000399e46	vmovaps	(%r15,%rcx), %xmm0
0000000000399e4c	movq	0x8(%rsp), %rcx
0000000000399e51	vsubps	%xmm8, %xmm0, %xmm7
0000000000399e56	vmulps	%xmm7, %xmm6, %xmm6
0000000000399e5a	vshufps	$0xff, %xmm2, %xmm2, %xmm2      ## xmm2 = xmm2[3,3,3,3]
0000000000399e5f	vshufps	$0x55, %xmm1, %xmm1, %xmm7      ## xmm7 = xmm1[1,1,1,1]
0000000000399e64	vminps	%xmm7, %xmm2, %xmm2
0000000000399e68	vsubps	%xmm0, %xmm13, %xmm7
0000000000399e6c	vmovaps	0x80(%rsp), %xmm13
0000000000399e75	vsubps	%xmm13, %xmm8, %xmm11
0000000000399e7a	vmulps	%xmm11, %xmm15, %xmm11
0000000000399e7f	vaddps	%xmm6, %xmm11, %xmm6
0000000000399e83	vmulps	%xmm7, %xmm14, %xmm7
0000000000399e87	vaddps	%xmm7, %xmm6, %xmm6
0000000000399e8b	vcmpnleps	%xmm10, %xmm2, %xmm2
0000000000399e91	vblendvps	%xmm2, %xmm6, %xmm3, %xmm2
0000000000399e97	vmovshdup	%xmm9, %xmm3            ## xmm3 = xmm9[1,1,3,3]
0000000000399e9c	vcmpltss	%xmm3, %xmm9, %xmm3
0000000000399ea1	vandps	%xmm3, %xmm12, %xmm3
0000000000399ea5	vsubps	0xc0(%rsp), %xmm0, %xmm0
0000000000399eae	vmulps	%xmm0, %xmm15, %xmm0
0000000000399eb2	vaddps	0xa0(%rsp), %xmm0, %xmm0
0000000000399ebb	vaddps	%xmm7, %xmm0, %xmm0
0000000000399ebf	vmovaps	0x4fac39(%rip), %ymm7
0000000000399ec7	vshufps	$0xaa, %xmm1, %xmm1, %xmm6      ## xmm6 = xmm1[2,2,2,2]
0000000000399ecc	vshufps	$0x0, %xmm3, %xmm3, %xmm3       ## xmm3 = xmm3[0,0,0,0]
0000000000399ed1	vminps	%xmm3, %xmm6, %xmm3
0000000000399ed5	vcmpnleps	%xmm10, %xmm3, %xmm3
0000000000399edb	vblendvps	%xmm3, %xmm0, %xmm2, %xmm0
0000000000399ee1	vsubps	%xmm8, %xmm4, %xmm2
0000000000399ee6	vaddps	%xmm5, %xmm11, %xmm3
0000000000399eea	vmulps	%xmm2, %xmm14, %xmm2
0000000000399eee	vaddps	%xmm3, %xmm2, %xmm2
0000000000399ef2	vshufps	$0xff, %xmm1, %xmm1, %xmm1      ## xmm1 = xmm1[3,3,3,3]
0000000000399ef7	vminps	%xmm6, %xmm1, %xmm1
0000000000399efb	vmovaps	0x40(%rsp), %ymm6
0000000000399f01	vcmpnleps	%xmm10, %xmm1, %xmm1
0000000000399f07	vblendvps	%xmm1, %xmm2, %xmm0, %xmm0
0000000000399f0d	vaddps	%xmm0, %xmm13, %xmm0
0000000000399f11	vbroadcastss	0x8(%r14), %xmm1
0000000000399f17	vmulps	%xmm0, %xmm1, %xmm0
0000000000399f1b	vbroadcastss	0xc(%r14), %xmm1
0000000000399f21	vaddps	%xmm0, %xmm1, %xmm0
0000000000399f25	vmovaps	0x40(%r14), %xmm1
0000000000399f2b	vcmpltps	%xmm10, %xmm1, %xmm1
0000000000399f31	vblendvps	%xmm1, 0x120(%rsp), %xmm0, %xmm0
0000000000399f3c	vmovaps	%xmm0, (%r8,%rbx)
0000000000399f42	jmp	0x3994b0
0000000000399f47	leaq	-0x28(%rbp), %rsp
0000000000399f4b	popq	%rbx
0000000000399f4c	popq	%r12
0000000000399f4e	popq	%r13
0000000000399f50	popq	%r14
0000000000399f52	popq	%r15
0000000000399f54	popq	%rbp
0000000000399f55	vzeroupper
0000000000399f58	xorl	%eax, %eax
0000000000399f5a	retq
0000000000399f5b	nopl	(%rax,%rax)
