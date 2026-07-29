__ZN18OZSceneArrangement16findExtremePointERK5PCBoxIdERK9PCVector4IdERK14PCMatrix44TmplIdEd:
00000000005043d0	pushq	%rbp
00000000005043d1	movq	%rsp, %rbp
00000000005043d4	subq	$0x100, %rsp                    ## imm = 0x100
00000000005043db	movsd	%xmm0, -0x98(%rbp)
00000000005043e3	movq	%rdi, %rax
00000000005043e6	movsd	0x10(%rsi), %xmm4
00000000005043eb	movapd	%xmm4, -0xe0(%rbp)
00000000005043f3	movsd	0x20(%rsi), %xmm6
00000000005043f8	movapd	%xmm6, -0x90(%rbp)
0000000000504400	movsd	0x28(%rsi), %xmm14
0000000000504406	movupd	0x20(%rcx), %xmm2
000000000050440b	movupd	0x30(%rcx), %xmm1
0000000000504410	movupd	(%rcx), %xmm3
0000000000504414	movupd	0x10(%rcx), %xmm0
0000000000504419	movddup	%xmm14, %xmm5                   ## xmm5 = xmm14[0,0]
000000000050441e	movapd	%xmm0, -0x170(%rbp)
0000000000504426	movapd	%xmm1, -0x160(%rbp)
000000000050442e	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000504432	movapd	%xmm5, %xmm13
0000000000504437	mulpd	%xmm0, %xmm13
000000000050443c	movddup	%xmm6, %xmm1                    ## xmm1 = xmm6[0,0]
0000000000504440	mulpd	%xmm1, %xmm0
0000000000504444	movapd	%xmm0, -0x80(%rbp)
0000000000504449	movddup	%xmm4, %xmm0                    ## xmm0 = xmm4[0,0]
000000000050444d	movapd	%xmm3, %xmm4
0000000000504451	unpckhpd	%xmm2, %xmm4                    ## xmm4 = xmm4[1],xmm2[1]
0000000000504455	mulpd	%xmm0, %xmm4
0000000000504459	unpcklpd	%xmm2, %xmm3                    ## xmm3 = xmm3[0],xmm2[0]
000000000050445d	movupd	0x70(%rcx), %xmm2
0000000000504462	movupd	0x50(%rcx), %xmm9
0000000000504468	movapd	%xmm9, -0x140(%rbp)
0000000000504471	movapd	%xmm2, -0x150(%rbp)
0000000000504479	unpcklpd	%xmm2, %xmm9                    ## xmm9 = xmm9[0],xmm2[0]
000000000050447e	mulpd	%xmm9, %xmm5
0000000000504483	mulpd	%xmm1, %xmm9
0000000000504488	movupd	0x60(%rcx), %xmm1
000000000050448d	movupd	0x40(%rcx), %xmm8
0000000000504493	movapd	%xmm8, %xmm10
0000000000504498	unpckhpd	%xmm1, %xmm10                   ## xmm10 = xmm10[1],xmm1[1]
000000000050449d	mulpd	%xmm0, %xmm10
00000000005044a2	unpcklpd	%xmm1, %xmm8                    ## xmm8 = xmm8[0],xmm1[0]
00000000005044a7	movsd	0x8(%rsi), %xmm0
00000000005044ac	movapd	%xmm0, -0x180(%rbp)
00000000005044b4	movddup	%xmm0, %xmm6                    ## xmm6 = xmm0[0,0]
00000000005044b8	movapd	%xmm6, %xmm0
00000000005044bc	movapd	%xmm3, -0x40(%rbp)
00000000005044c1	mulpd	%xmm3, %xmm0
00000000005044c5	movapd	%xmm0, %xmm12
00000000005044ca	movapd	%xmm4, -0x120(%rbp)
00000000005044d2	addpd	%xmm4, %xmm12
00000000005044d7	movapd	%xmm12, %xmm2
00000000005044dc	addpd	%xmm13, %xmm2
00000000005044e1	movupd	0x18(%rcx), %xmm7
00000000005044e6	movhpd	0x38(%rcx), %xmm7               ## xmm7 = xmm7[0],mem[0]
00000000005044eb	addpd	%xmm7, %xmm2
00000000005044ef	movupd	(%rdx), %xmm3
00000000005044f3	mulpd	%xmm3, %xmm2
00000000005044f7	movapd	%xmm2, %xmm1
00000000005044fb	unpckhpd	%xmm2, %xmm1                    ## xmm1 = xmm1[1],xmm2[1]
00000000005044ff	addsd	%xmm2, %xmm1
0000000000504503	movapd	%xmm8, -0xf0(%rbp)
000000000050450c	mulpd	%xmm8, %xmm6
0000000000504511	movapd	%xmm6, %xmm8
0000000000504516	movapd	%xmm10, -0x100(%rbp)
000000000050451f	addpd	%xmm10, %xmm8
0000000000504524	movapd	%xmm8, %xmm4
0000000000504529	addpd	%xmm5, %xmm4
000000000050452d	movupd	0x58(%rcx), %xmm15
0000000000504533	movhpd	0x78(%rcx), %xmm15              ## xmm15 = xmm15[0],mem[0]
0000000000504539	addpd	%xmm15, %xmm4
000000000050453e	movupd	0x10(%rdx), %xmm10
0000000000504544	mulpd	%xmm10, %xmm4
0000000000504549	addsd	%xmm4, %xmm1
000000000050454d	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
0000000000504551	movupd	0x8(%rcx), %xmm11
0000000000504557	movhpd	0x28(%rcx), %xmm11              ## xmm11 = xmm11[0],mem[0]
000000000050455d	addsd	%xmm1, %xmm4
0000000000504561	movsd	0x18(%rsi), %xmm1
0000000000504566	movapd	%xmm1, -0x30(%rbp)
000000000050456b	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000050456f	mulpd	%xmm1, %xmm11
0000000000504574	addpd	%xmm11, %xmm0
0000000000504579	movapd	%xmm0, %xmm2
000000000050457d	movapd	%xmm13, -0xc0(%rbp)
0000000000504586	addpd	%xmm13, %xmm2
000000000050458b	addpd	%xmm7, %xmm2
000000000050458f	movapd	%xmm3, -0x60(%rbp)
0000000000504594	mulpd	%xmm3, %xmm2
0000000000504598	addpd	-0x80(%rbp), %xmm0
000000000050459d	addpd	%xmm7, %xmm0
00000000005045a1	mulpd	%xmm3, %xmm0
00000000005045a5	haddpd	%xmm2, %xmm0
00000000005045a9	movupd	0x48(%rcx), %xmm2
00000000005045ae	movhpd	0x68(%rcx), %xmm2               ## xmm2 = xmm2[0],mem[0]
00000000005045b3	mulpd	%xmm1, %xmm2
00000000005045b7	addpd	%xmm2, %xmm6
00000000005045bb	movapd	%xmm6, %xmm1
00000000005045bf	movapd	%xmm5, -0x130(%rbp)
00000000005045c7	addpd	%xmm5, %xmm1
00000000005045cb	addpd	%xmm15, %xmm1
00000000005045d0	mulpd	%xmm10, %xmm1
00000000005045d5	addpd	%xmm9, %xmm6
00000000005045da	addpd	%xmm15, %xmm6
00000000005045df	mulpd	%xmm10, %xmm6
00000000005045e4	movapd	%xmm6, %xmm5
00000000005045e8	unpcklpd	%xmm1, %xmm5                    ## xmm5 = xmm5[0],xmm1[0]
00000000005045ec	addpd	%xmm0, %xmm5
00000000005045f0	unpckhpd	%xmm1, %xmm6                    ## xmm6 = xmm6[1],xmm1[1]
00000000005045f4	addpd	%xmm5, %xmm6
00000000005045f8	movapd	%xmm6, %xmm1
00000000005045fc	unpckhpd	%xmm6, %xmm1                    ## xmm1 = xmm1[1],xmm6[1]
0000000000504600	movapd	%xmm6, %xmm0
0000000000504604	cmpnltsd	%xmm1, %xmm0
0000000000504609	movapd	-0x90(%rbp), %xmm3
0000000000504611	movapd	%xmm3, %xmm5
0000000000504615	blendvpd	%xmm0, %xmm14, %xmm5
000000000050461b	movapd	%xmm1, %xmm0
000000000050461f	cmpnltsd	%xmm6, %xmm0
0000000000504624	movapd	%xmm3, %xmm13
0000000000504629	blendvpd	%xmm0, %xmm14, %xmm13
000000000050462f	movapd	%xmm6, %xmm3
0000000000504633	minsd	%xmm1, %xmm3
0000000000504637	movapd	%xmm4, %xmm0
000000000050463b	cmpnltsd	%xmm3, %xmm0
0000000000504640	movapd	%xmm14, -0x50(%rbp)
0000000000504646	blendvpd	%xmm0, %xmm5, %xmm14
000000000050464c	addpd	-0x80(%rbp), %xmm12
0000000000504652	movapd	%xmm7, -0x110(%rbp)
000000000050465a	addpd	%xmm7, %xmm12
000000000050465f	mulpd	-0x60(%rbp), %xmm12
0000000000504665	movapd	%xmm12, %xmm0
000000000050466a	unpckhpd	%xmm12, %xmm0                   ## xmm0 = xmm0[1],xmm12[1]
000000000050466f	addsd	%xmm12, %xmm0
0000000000504674	movapd	%xmm9, -0xd0(%rbp)
000000000050467d	addpd	%xmm9, %xmm8
0000000000504682	addpd	%xmm15, %xmm8
0000000000504687	movapd	%xmm10, -0x70(%rbp)
000000000050468d	mulpd	%xmm10, %xmm8
0000000000504692	addsd	%xmm8, %xmm0
0000000000504697	unpckhpd	%xmm8, %xmm8                    ## xmm8 = xmm8[1,1]
000000000050469c	addsd	%xmm0, %xmm8
00000000005046a1	ucomisd	%xmm4, %xmm3
00000000005046a5	movapd	%xmm4, %xmm5
00000000005046a9	minsd	%xmm3, %xmm5
00000000005046ad	movapd	-0xe0(%rbp), %xmm3
00000000005046b5	movsd	(%rsi), %xmm0
00000000005046b9	movaps	%xmm0, -0x10(%rbp)
00000000005046bd	movapd	-0x30(%rbp), %xmm0
00000000005046c2	jbe	0x5046c8
00000000005046c4	movapd	%xmm3, %xmm0
00000000005046c8	movddup	-0x10(%rbp), %xmm12             ## xmm12 = mem[0,0]
00000000005046ce	maxsd	%xmm1, %xmm6
00000000005046d2	ucomisd	%xmm8, %xmm5
00000000005046d7	jbe	0x5046dd
00000000005046d9	movapd	%xmm3, %xmm0
00000000005046dd	movsd	%xmm0, -0x18(%rbp)
00000000005046e2	movapd	-0x40(%rbp), %xmm7
00000000005046e7	mulpd	%xmm12, %xmm7
00000000005046ec	ucomisd	%xmm6, %xmm4
00000000005046f0	movapd	%xmm6, %xmm0
00000000005046f4	cmpnltsd	%xmm4, %xmm0
00000000005046f9	movapd	-0x50(%rbp), %xmm1
00000000005046fe	blendvpd	%xmm0, %xmm13, %xmm1
0000000000504704	maxsd	%xmm6, %xmm4
0000000000504708	movapd	%xmm8, %xmm0
000000000050470d	cmpnltsd	%xmm5, %xmm0
0000000000504712	movapd	-0x90(%rbp), %xmm6
000000000050471a	blendvpd	%xmm0, %xmm14, %xmm6
0000000000504720	movapd	%xmm6, -0xb0(%rbp)
0000000000504728	movapd	-0x30(%rbp), %xmm6
000000000050472d	movapd	-0x130(%rbp), %xmm9
0000000000504736	movapd	-0x110(%rbp), %xmm10
000000000050473f	jbe	0x504745
0000000000504741	movapd	%xmm3, %xmm6
0000000000504745	mulpd	-0xf0(%rbp), %xmm12
000000000050474e	addpd	%xmm7, %xmm11
0000000000504753	movapd	%xmm8, %xmm13
0000000000504758	minsd	%xmm5, %xmm13
000000000050475d	ucomisd	%xmm4, %xmm8
0000000000504762	movapd	%xmm4, %xmm0
0000000000504766	cmpnltsd	%xmm8, %xmm0
000000000050476c	movapd	-0x90(%rbp), %xmm14
0000000000504775	movapd	%xmm14, %xmm5
000000000050477a	blendvpd	%xmm0, %xmm1, %xmm5
000000000050477f	movapd	%xmm5, -0x40(%rbp)
0000000000504784	jbe	0x50478a
0000000000504786	movapd	%xmm3, %xmm6
000000000050478a	maxsd	%xmm4, %xmm8
000000000050478f	addpd	%xmm12, %xmm2
0000000000504794	movapd	%xmm11, %xmm1
0000000000504799	addpd	-0xc0(%rbp), %xmm1
00000000005047a1	addpd	%xmm10, %xmm1
00000000005047a6	mulpd	-0x60(%rbp), %xmm1
00000000005047ab	movapd	%xmm2, %xmm0
00000000005047af	addpd	%xmm9, %xmm0
00000000005047b4	addpd	%xmm15, %xmm0
00000000005047b9	mulpd	-0x70(%rbp), %xmm0
00000000005047be	movapd	%xmm1, %xmm3
00000000005047c2	unpckhpd	%xmm1, %xmm3                    ## xmm3 = xmm3[1],xmm1[1]
00000000005047c6	addsd	%xmm1, %xmm3
00000000005047ca	addsd	%xmm0, %xmm3
00000000005047ce	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
00000000005047d2	addsd	%xmm3, %xmm0
00000000005047d6	ucomisd	%xmm0, %xmm13
00000000005047db	movapd	-0x180(%rbp), %xmm4
00000000005047e3	movapd	%xmm4, %xmm5
00000000005047e7	jbe	0x504808
00000000005047e9	movaps	-0x50(%rbp), %xmm1
00000000005047ed	movaps	%xmm1, -0xb0(%rbp)
00000000005047f4	movapd	-0x30(%rbp), %xmm1
00000000005047f9	movsd	%xmm1, -0x18(%rbp)
00000000005047fe	movapd	-0x10(%rbp), %xmm5
0000000000504803	movapd	%xmm0, %xmm13
0000000000504808	ucomisd	%xmm8, %xmm0
000000000050480d	movapd	-0x80(%rbp), %xmm1
0000000000504812	jbe	0x50482d
0000000000504814	movapd	-0x50(%rbp), %xmm3
0000000000504819	movapd	%xmm3, -0x40(%rbp)
000000000050481e	movapd	-0x30(%rbp), %xmm6
0000000000504823	movapd	-0x10(%rbp), %xmm4
0000000000504828	movapd	%xmm0, %xmm8
000000000050482d	addpd	%xmm1, %xmm11
0000000000504832	addpd	%xmm10, %xmm11
0000000000504837	mulpd	-0x60(%rbp), %xmm11
000000000050483d	addpd	-0xd0(%rbp), %xmm2
0000000000504845	addpd	%xmm15, %xmm2
000000000050484a	mulpd	-0x70(%rbp), %xmm2
000000000050484f	movapd	%xmm11, %xmm0
0000000000504854	unpckhpd	%xmm11, %xmm0                   ## xmm0 = xmm0[1],xmm11[1]
0000000000504859	addsd	%xmm11, %xmm0
000000000050485e	addsd	%xmm2, %xmm0
0000000000504862	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
0000000000504866	addsd	%xmm0, %xmm2
000000000050486a	ucomisd	%xmm2, %xmm13
000000000050486f	movapd	-0xe0(%rbp), %xmm3
0000000000504877	movapd	-0xb0(%rbp), %xmm11
0000000000504880	jbe	0x50489b
0000000000504882	movapd	%xmm14, %xmm11
0000000000504887	movapd	-0x30(%rbp), %xmm0
000000000050488c	movsd	%xmm0, -0x18(%rbp)
0000000000504891	movapd	-0x10(%rbp), %xmm5
0000000000504896	movapd	%xmm2, %xmm13
000000000050489b	ucomisd	%xmm8, %xmm2
00000000005048a0	jbe	0x5048b7
00000000005048a2	movapd	%xmm14, -0x40(%rbp)
00000000005048a8	movapd	-0x30(%rbp), %xmm6
00000000005048ad	movapd	-0x10(%rbp), %xmm4
00000000005048b2	movapd	%xmm2, %xmm8
00000000005048b7	addpd	-0x120(%rbp), %xmm7
00000000005048bf	addpd	-0x100(%rbp), %xmm12
00000000005048c8	movapd	-0xc0(%rbp), %xmm0
00000000005048d0	addpd	%xmm7, %xmm0
00000000005048d4	addpd	%xmm0, %xmm10
00000000005048d9	mulpd	-0x60(%rbp), %xmm10
00000000005048df	addpd	%xmm12, %xmm9
00000000005048e4	addpd	%xmm9, %xmm15
00000000005048e9	mulpd	-0x70(%rbp), %xmm15
00000000005048ef	movapd	%xmm10, %xmm0
00000000005048f4	unpckhpd	%xmm10, %xmm0                   ## xmm0 = xmm0[1],xmm10[1]
00000000005048f9	addsd	%xmm10, %xmm0
00000000005048fe	addsd	%xmm15, %xmm0
0000000000504903	unpckhpd	%xmm15, %xmm15                  ## xmm15 = xmm15[1,1]
0000000000504908	addsd	%xmm0, %xmm15
000000000050490d	ucomisd	%xmm15, %xmm13
0000000000504912	movsd	-0x18(%rbp), %xmm9
0000000000504918	jbe	0x50492f
000000000050491a	movapd	-0x50(%rbp), %xmm11
0000000000504920	movapd	%xmm3, %xmm9
0000000000504925	movapd	-0x10(%rbp), %xmm5
000000000050492a	movapd	%xmm15, %xmm13
000000000050492f	ucomisd	%xmm8, %xmm15
0000000000504934	movapd	-0x140(%rbp), %xmm2
000000000050493c	movapd	-0x40(%rbp), %xmm10
0000000000504942	jbe	0x504958
0000000000504944	movapd	-0x50(%rbp), %xmm10
000000000050494a	movapd	%xmm3, %xmm6
000000000050494e	movapd	-0x10(%rbp), %xmm4
0000000000504953	movapd	%xmm15, %xmm8
0000000000504958	addpd	%xmm1, %xmm7
000000000050495c	addpd	-0xd0(%rbp), %xmm12
0000000000504965	movapd	-0x170(%rbp), %xmm1
000000000050496d	unpckhpd	-0x160(%rbp), %xmm1             ## xmm1 = xmm1[1],mem[1]
0000000000504975	addpd	%xmm7, %xmm1
0000000000504979	mulpd	-0x60(%rbp), %xmm1
000000000050497e	unpckhpd	-0x150(%rbp), %xmm2             ## xmm2 = xmm2[1],mem[1]
0000000000504986	addpd	%xmm12, %xmm2
000000000050498b	mulpd	-0x70(%rbp), %xmm2
0000000000504990	movapd	%xmm1, %xmm0
0000000000504994	unpckhpd	%xmm1, %xmm0                    ## xmm0 = xmm0[1],xmm1[1]
0000000000504998	addsd	%xmm1, %xmm0
000000000050499c	addsd	%xmm2, %xmm0
00000000005049a0	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000005049a4	addsd	%xmm0, %xmm2
00000000005049a8	ucomisd	%xmm2, %xmm13
00000000005049ad	movapd	%xmm2, %xmm0
00000000005049b1	cmpnltsd	%xmm13, %xmm0
00000000005049b7	movapd	%xmm14, %xmm1
00000000005049bc	blendvpd	%xmm0, %xmm11, %xmm1
00000000005049c2	jbe	0x5049ce
00000000005049c4	movapd	%xmm3, %xmm9
00000000005049c9	movapd	-0x10(%rbp), %xmm5
00000000005049ce	ucomisd	%xmm8, %xmm2
00000000005049d3	cmpnltsd	%xmm2, %xmm8
00000000005049d9	movapd	%xmm8, %xmm0
00000000005049de	blendvpd	%xmm0, %xmm10, %xmm14
00000000005049e4	jbe	0x5049ef
00000000005049e6	movapd	%xmm3, %xmm6
00000000005049ea	movapd	-0x10(%rbp), %xmm4
00000000005049ef	movsd	0x2009e9(%rip), %xmm0
00000000005049f7	movapd	%xmm0, %xmm2
00000000005049fb	movsd	-0x98(%rbp), %xmm3
0000000000504a03	subsd	%xmm3, %xmm2
0000000000504a07	mulsd	%xmm2, %xmm5
0000000000504a0b	mulsd	%xmm2, %xmm9
0000000000504a10	mulsd	%xmm2, %xmm1
0000000000504a14	mulsd	%xmm3, %xmm4
0000000000504a18	addsd	%xmm5, %xmm4
0000000000504a1c	mulsd	%xmm3, %xmm6
0000000000504a20	addsd	%xmm9, %xmm6
0000000000504a25	mulsd	%xmm3, %xmm14
0000000000504a2a	addsd	%xmm1, %xmm14
0000000000504a2f	addsd	%xmm3, %xmm2
0000000000504a33	divsd	%xmm2, %xmm0
0000000000504a37	mulsd	%xmm0, %xmm4
0000000000504a3b	mulsd	%xmm0, %xmm6
0000000000504a3f	mulsd	%xmm14, %xmm0
0000000000504a44	movsd	%xmm4, (%rax)
0000000000504a48	movsd	%xmm6, 0x8(%rax)
0000000000504a4d	movsd	%xmm0, 0x10(%rax)
0000000000504a52	addq	$0x100, %rsp                    ## imm = 0x100
0000000000504a59	popq	%rbp
0000000000504a5a	retq
0000000000504a5b	nopl	(%rax,%rax)
