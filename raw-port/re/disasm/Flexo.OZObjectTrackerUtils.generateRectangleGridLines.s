__ZN20OZObjectTrackerUtils26generateRectangleGridLinesERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEER14PCMatrix44TmplIdERKS4_dddb:
0000000000cb3ff0	pushq	%rbp
0000000000cb3ff1	movq	%rsp, %rbp
0000000000cb3ff4	pushq	%r15
0000000000cb3ff6	pushq	%r14
0000000000cb3ff8	pushq	%r12
0000000000cb3ffa	pushq	%rbx
0000000000cb3ffb	subq	$0x60, %rsp
0000000000cb3fff	movq	%rdx, %rbx
0000000000cb4002	movq	%rsi, %r14
0000000000cb4005	movq	%rdi, %r15
0000000000cb4008	xorpd	%xmm3, %xmm3
0000000000cb400c	ucomisd	%xmm3, %xmm1
0000000000cb4010	movapd	%xmm2, -0x80(%rbp)
0000000000cb4015	movapd	%xmm0, -0x70(%rbp)
0000000000cb401a	jbe	0xcb4179
0000000000cb4020	testb	%cl, %cl
0000000000cb4022	movapd	%xmm1, -0x60(%rbp)
0000000000cb4027	je	0xcb42de
0000000000cb402d	leaq	-0x50(%rbp), %r12
0000000000cb4031	nopw	%cs:(%rax,%rax)
0000000000cb4040	movapd	%xmm3, -0x30(%rbp)
0000000000cb4045	movsd	0x78(%r14), %xmm1
0000000000cb404b	movsd	0x28(%r14), %xmm0
0000000000cb4051	movsd	0x38(%r14), %xmm6
0000000000cb4057	movupd	(%rbx), %xmm4
0000000000cb405b	movapd	-0x30(%rbp), %xmm7
0000000000cb4060	unpcklpd	%xmm2, %xmm7                    ## xmm7 = xmm7[0],xmm2[0]
0000000000cb4064	movapd	%xmm4, %xmm3
0000000000cb4068	subpd	%xmm7, %xmm3
0000000000cb406c	addpd	%xmm4, %xmm7
0000000000cb4070	movapd	%xmm3, %xmm8
0000000000cb4075	shufpd	$0x1, %xmm7, %xmm8              ## xmm8 = xmm8[1],xmm7[0]
0000000000cb407b	movsd	0x8(%rbx), %xmm12
0000000000cb4081	addsd	%xmm2, %xmm12
0000000000cb4086	blendpd	$0x2, %xmm3, %xmm7              ## xmm7 = xmm7[0],xmm3[1]
0000000000cb408c	movupd	(%r14), %xmm3
0000000000cb4091	movupd	0x8(%r14), %xmm5
0000000000cb4097	movupd	0x18(%r14), %xmm4
0000000000cb409d	movupd	0x60(%r14), %xmm9
0000000000cb40a3	mulpd	%xmm7, %xmm9
0000000000cb40a8	movapd	%xmm9, %xmm10
0000000000cb40ad	unpckhpd	%xmm9, %xmm10                   ## xmm10 = xmm10[1],xmm9[1]
0000000000cb40b2	addsd	%xmm9, %xmm10
0000000000cb40b7	addsd	%xmm1, %xmm10
0000000000cb40bc	movapd	%xmm3, %xmm11
0000000000cb40c1	unpckhpd	%xmm4, %xmm11                   ## xmm11 = xmm11[1],xmm4[1]
0000000000cb40c6	mulpd	%xmm8, %xmm11
0000000000cb40cb	unpcklpd	%xmm0, %xmm3                    ## xmm3 = xmm3[0],xmm0[0]
0000000000cb40cf	mulpd	%xmm7, %xmm3
0000000000cb40d3	movapd	%xmm11, %xmm7
0000000000cb40d8	addpd	%xmm3, %xmm7
0000000000cb40dc	unpcklpd	%xmm6, %xmm4                    ## xmm4 = xmm4[0],xmm6[0]
0000000000cb40e0	addpd	%xmm4, %xmm7
0000000000cb40e4	movddup	%xmm10, %xmm6                   ## xmm6 = xmm10[0,0]
0000000000cb40e9	movddup	%xmm12, %xmm8                   ## xmm8 = xmm12[0,0]
0000000000cb40ee	mulsd	0x68(%r14), %xmm12
0000000000cb40f4	divpd	%xmm6, %xmm7
0000000000cb40f8	addsd	%xmm9, %xmm12
0000000000cb40fd	addsd	%xmm1, %xmm12
0000000000cb4102	movapd	%xmm7, -0x50(%rbp)
0000000000cb4107	unpcklpd	%xmm0, %xmm5                    ## xmm5 = xmm5[0],xmm0[0]
0000000000cb410b	mulpd	%xmm8, %xmm5
0000000000cb4110	blendpd	$0x2, %xmm11, %xmm3             ## xmm3 = xmm3[0],xmm11[1]
0000000000cb4117	addpd	%xmm5, %xmm3
0000000000cb411b	addpd	%xmm4, %xmm3
0000000000cb411f	movddup	%xmm12, %xmm0                   ## xmm0 = xmm12[0,0]
0000000000cb4124	divpd	%xmm0, %xmm3
0000000000cb4128	movapd	%xmm3, -0x40(%rbp)
0000000000cb412d	movq	%r15, %rdi
0000000000cb4130	movq	%r12, %rsi
0000000000cb4133	callq	__ZNSt3__16vectorINS_4pairI9PCVector2IdES3_EENS_9allocatorIS4_EEE12emplace_backIJS4_EEERS4_DpOT_ ## std::__1::pair<PCVector2<double>, PCVector2<double>>& std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>::emplace_back<std::__1::pair<PCVector2<double>, PCVector2<double>>>(std::__1::pair<PCVector2<double>, PCVector2<double>>&&)
0000000000cb4138	movapd	-0x30(%rbp), %xmm3
0000000000cb413d	movapd	-0x70(%rbp), %xmm0
0000000000cb4142	movapd	-0x60(%rbp), %xmm1
0000000000cb4147	movapd	-0x80(%rbp), %xmm2
0000000000cb414c	addsd	%xmm0, %xmm3
0000000000cb4150	ucomisd	%xmm3, %xmm1
0000000000cb4154	ja	0xcb4040
0000000000cb415a	ucomisd	%xmm0, %xmm1
0000000000cb415e	jbe	0xcb4541
0000000000cb4164	movapd	0x8b8b03(%rip), %xmm9
0000000000cb416d	xorpd	%xmm9, %xmm1
0000000000cb4172	xorpd	%xmm0, %xmm9
0000000000cb4177	jmp	0xcb419e
0000000000cb4179	ucomisd	%xmm0, %xmm1
0000000000cb417d	jbe	0xcb4541
0000000000cb4183	movapd	0x8b8ae4(%rip), %xmm9
0000000000cb418c	xorpd	%xmm9, %xmm1
0000000000cb4191	xorpd	%xmm0, %xmm9
0000000000cb4196	testb	%cl, %cl
0000000000cb4198	je	0xcb4419
0000000000cb419e	leaq	-0x50(%rbp), %r12
0000000000cb41a2	movapd	%xmm1, -0x60(%rbp)
0000000000cb41a7	nopw	(%rax,%rax)
0000000000cb41b0	movapd	%xmm9, -0x30(%rbp)
0000000000cb41b6	movupd	(%rbx), %xmm0
0000000000cb41ba	movsd	0x8(%rbx), %xmm1
0000000000cb41bf	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000cb41c3	subsd	%xmm2, %xmm1
0000000000cb41c7	movupd	(%r14), %xmm6
0000000000cb41cc	movsd	0x68(%r14), %xmm7
0000000000cb41d2	movsd	0x8(%r14), %xmm5
0000000000cb41d8	movapd	%xmm5, %xmm8
0000000000cb41dd	movhpd	0x60(%r14), %xmm8               ## xmm8 = xmm8[0],mem[0]
0000000000cb41e3	unpcklpd	%xmm7, %xmm6                    ## xmm6 = xmm6[0],xmm7[0]
0000000000cb41e7	movsd	0x18(%r14), %xmm4
0000000000cb41ed	movhpd	0x78(%r14), %xmm4               ## xmm4 = xmm4[0],mem[0]
0000000000cb41f3	movsd	0x28(%r14), %xmm10
0000000000cb41f9	mulsd	%xmm1, %xmm10
0000000000cb41fe	movsd	0x38(%r14), %xmm3
0000000000cb4204	unpcklpd	%xmm7, %xmm5                    ## xmm5 = xmm5[0],xmm7[0]
0000000000cb4208	movapd	%xmm9, %xmm7
0000000000cb420d	unpcklpd	%xmm2, %xmm7                    ## xmm7 = xmm7[0],xmm2[0]
0000000000cb4211	addpd	%xmm7, %xmm0
0000000000cb4215	movapd	%xmm0, %xmm7
0000000000cb4219	unpcklpd	%xmm1, %xmm7                    ## xmm7 = xmm7[0],xmm1[0]
0000000000cb421d	mulpd	%xmm6, %xmm7
0000000000cb4221	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
0000000000cb4225	mulpd	%xmm8, %xmm1
0000000000cb422a	movapd	%xmm1, %xmm6
0000000000cb422e	addpd	%xmm7, %xmm6
0000000000cb4232	addpd	%xmm4, %xmm6
0000000000cb4236	movapd	%xmm6, %xmm8
0000000000cb423b	unpckhpd	%xmm6, %xmm8                    ## xmm8 = xmm8[1],xmm6[1]
0000000000cb4240	divsd	%xmm8, %xmm6
0000000000cb4245	movupd	0x20(%r14), %xmm9
0000000000cb424b	mulpd	%xmm0, %xmm9
0000000000cb4250	addsd	%xmm9, %xmm10
0000000000cb4255	addsd	%xmm3, %xmm10
0000000000cb425a	divsd	%xmm8, %xmm10
0000000000cb425f	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
0000000000cb4263	mulpd	%xmm5, %xmm0
0000000000cb4267	blendpd	$0x1, %xmm7, %xmm1              ## xmm1 = xmm7[0],xmm1[1]
0000000000cb426d	addpd	%xmm0, %xmm1
0000000000cb4271	addpd	%xmm4, %xmm1
0000000000cb4275	movapd	%xmm1, %xmm0
0000000000cb4279	unpckhpd	%xmm1, %xmm0                    ## xmm0 = xmm0[1],xmm1[1]
0000000000cb427d	divsd	%xmm0, %xmm1
0000000000cb4281	movapd	%xmm9, %xmm4
0000000000cb4286	unpckhpd	%xmm9, %xmm4                    ## xmm4 = xmm4[1],xmm9[1]
0000000000cb428b	addsd	%xmm9, %xmm4
0000000000cb4290	addsd	%xmm3, %xmm4
0000000000cb4294	divsd	%xmm0, %xmm4
0000000000cb4298	movsd	%xmm6, -0x50(%rbp)
0000000000cb429d	movsd	%xmm10, -0x48(%rbp)
0000000000cb42a3	movsd	%xmm1, -0x40(%rbp)
0000000000cb42a8	movsd	%xmm4, -0x38(%rbp)
0000000000cb42ad	movq	%r15, %rdi
0000000000cb42b0	movq	%r12, %rsi
0000000000cb42b3	callq	__ZNSt3__16vectorINS_4pairI9PCVector2IdES3_EENS_9allocatorIS4_EEE12emplace_backIJS4_EEERS4_DpOT_ ## std::__1::pair<PCVector2<double>, PCVector2<double>>& std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>::emplace_back<std::__1::pair<PCVector2<double>, PCVector2<double>>>(std::__1::pair<PCVector2<double>, PCVector2<double>>&&)
0000000000cb42b8	movapd	-0x30(%rbp), %xmm9
0000000000cb42be	movapd	-0x60(%rbp), %xmm1
0000000000cb42c3	movapd	-0x80(%rbp), %xmm2
0000000000cb42c8	subsd	-0x70(%rbp), %xmm9
0000000000cb42ce	ucomisd	%xmm1, %xmm9
0000000000cb42d3	ja	0xcb41b0
0000000000cb42d9	jmp	0xcb4541
0000000000cb42de	xorpd	%xmm4, %xmm4
0000000000cb42e2	leaq	-0x50(%rbp), %r12
0000000000cb42e6	nopw	%cs:(%rax,%rax)
0000000000cb42f0	movapd	%xmm4, -0x30(%rbp)
0000000000cb42f5	movupd	(%rbx), %xmm0
0000000000cb42f9	movapd	%xmm2, %xmm3
0000000000cb42fd	unpcklpd	%xmm4, %xmm3                    ## xmm3 = xmm3[0],xmm4[0]
0000000000cb4301	movapd	%xmm0, %xmm4
0000000000cb4305	subpd	%xmm3, %xmm4
0000000000cb4309	addpd	%xmm0, %xmm3
0000000000cb430d	movapd	%xmm3, %xmm10
0000000000cb4312	blendpd	$0x1, %xmm4, %xmm10             ## xmm10 = xmm4[0],xmm10[1]
0000000000cb4319	addsd	%xmm2, %xmm0
0000000000cb431d	movupd	0x60(%r14), %xmm1
0000000000cb4323	mulpd	%xmm1, %xmm10
0000000000cb4328	movapd	%xmm10, %xmm5
0000000000cb432d	unpckhpd	%xmm10, %xmm5                   ## xmm5 = xmm5[1],xmm10[1]
0000000000cb4332	addsd	%xmm5, %xmm10
0000000000cb4337	movsd	0x78(%r14), %xmm6
0000000000cb433d	addsd	%xmm6, %xmm10
0000000000cb4342	mulsd	%xmm0, %xmm1
0000000000cb4346	addsd	%xmm5, %xmm1
0000000000cb434a	addsd	%xmm6, %xmm1
0000000000cb434e	movsd	0x28(%r14), %xmm5
0000000000cb4354	movsd	0x38(%r14), %xmm6
0000000000cb435a	movupd	(%r14), %xmm7
0000000000cb435f	movupd	0x18(%r14), %xmm8
0000000000cb4365	movddup	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0]
0000000000cb4369	movapd	%xmm8, %xmm9
0000000000cb436e	blendpd	$0x1, %xmm7, %xmm9              ## xmm9 = xmm7[0],xmm9[1]
0000000000cb4375	mulpd	%xmm4, %xmm9
0000000000cb437a	unpckhpd	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
0000000000cb437e	movsd	0x8(%r14), %xmm4
0000000000cb4384	unpcklpd	%xmm5, %xmm4                    ## xmm4 = xmm4[0],xmm5[0]
0000000000cb4388	mulpd	%xmm3, %xmm4
0000000000cb438c	addpd	%xmm4, %xmm9
0000000000cb4391	unpcklpd	%xmm6, %xmm8                    ## xmm8 = xmm8[0],xmm6[0]
0000000000cb4396	addpd	%xmm8, %xmm9
0000000000cb439b	movddup	%xmm10, %xmm2                   ## xmm2 = xmm10[0,0]
0000000000cb43a0	divpd	%xmm2, %xmm9
0000000000cb43a5	movhpd	0x20(%r14), %xmm7               ## xmm7 = xmm7[0],mem[0]
0000000000cb43ab	movapd	%xmm9, -0x50(%rbp)
0000000000cb43b1	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
0000000000cb43b5	mulpd	%xmm7, %xmm0
0000000000cb43b9	addpd	%xmm4, %xmm0
0000000000cb43bd	addpd	%xmm8, %xmm0
0000000000cb43c2	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
0000000000cb43c6	divpd	%xmm1, %xmm0
0000000000cb43ca	movapd	%xmm0, -0x40(%rbp)
0000000000cb43cf	movq	%r15, %rdi
0000000000cb43d2	movq	%r12, %rsi
0000000000cb43d5	callq	__ZNSt3__16vectorINS_4pairI9PCVector2IdES3_EENS_9allocatorIS4_EEE12emplace_backIJS4_EEERS4_DpOT_ ## std::__1::pair<PCVector2<double>, PCVector2<double>>& std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>::emplace_back<std::__1::pair<PCVector2<double>, PCVector2<double>>>(std::__1::pair<PCVector2<double>, PCVector2<double>>&&)
0000000000cb43da	movapd	-0x30(%rbp), %xmm4
0000000000cb43df	movapd	-0x70(%rbp), %xmm0
0000000000cb43e4	movapd	-0x60(%rbp), %xmm1
0000000000cb43e9	movapd	-0x80(%rbp), %xmm2
0000000000cb43ee	addsd	%xmm0, %xmm4
0000000000cb43f2	ucomisd	%xmm4, %xmm1
0000000000cb43f6	ja	0xcb42f0
0000000000cb43fc	ucomisd	%xmm0, %xmm1
0000000000cb4400	jbe	0xcb4541
0000000000cb4406	movapd	0x8b8861(%rip), %xmm9
0000000000cb440f	xorpd	%xmm9, %xmm1
0000000000cb4414	xorpd	%xmm0, %xmm9
0000000000cb4419	leaq	-0x50(%rbp), %r12
0000000000cb441d	movapd	%xmm1, -0x60(%rbp)
0000000000cb4422	nopw	%cs:(%rax,%rax)
0000000000cb4430	movapd	%xmm9, -0x30(%rbp)
0000000000cb4436	movsd	(%rbx), %xmm7
0000000000cb443a	movapd	%xmm2, %xmm0
0000000000cb443e	addsd	%xmm7, %xmm0
0000000000cb4442	movupd	(%r14), %xmm1
0000000000cb4447	movhpd	0x60(%r14), %xmm1               ## xmm1 = xmm1[0],mem[0]
0000000000cb444d	movsd	0x8(%r14), %xmm5
0000000000cb4453	movhpd	0x68(%r14), %xmm5               ## xmm5 = xmm5[0],mem[0]
0000000000cb4459	movsd	0x18(%r14), %xmm3
0000000000cb445f	movhpd	0x78(%r14), %xmm3               ## xmm3 = xmm3[0],mem[0]
0000000000cb4465	unpcklpd	%xmm9, %xmm7                    ## xmm7 = xmm7[0],xmm9[0]
0000000000cb446a	movapd	%xmm2, %xmm4
0000000000cb446e	movhpd	0x8(%rbx), %xmm4                ## xmm4 = xmm4[0],mem[0]
0000000000cb4473	movapd	%xmm7, %xmm6
0000000000cb4477	subpd	%xmm4, %xmm6
0000000000cb447b	addpd	%xmm7, %xmm4
0000000000cb447f	movapd	%xmm4, %xmm7
0000000000cb4483	blendpd	$0x1, %xmm6, %xmm7              ## xmm7 = xmm6[0],xmm7[1]
0000000000cb4489	movddup	%xmm6, %xmm2                    ## xmm2 = xmm6[0,0]
0000000000cb448d	mulpd	%xmm1, %xmm2
0000000000cb4491	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
0000000000cb4495	mulpd	%xmm5, %xmm4
0000000000cb4499	addpd	%xmm4, %xmm2
0000000000cb449d	addpd	%xmm3, %xmm2
0000000000cb44a1	movapd	%xmm2, %xmm6
0000000000cb44a5	unpckhpd	%xmm2, %xmm6                    ## xmm6 = xmm6[1],xmm2[1]
0000000000cb44a9	divsd	%xmm6, %xmm2
0000000000cb44ad	movupd	0x20(%r14), %xmm5
0000000000cb44b3	mulpd	%xmm7, %xmm5
0000000000cb44b7	movapd	%xmm5, %xmm7
0000000000cb44bb	unpckhpd	%xmm5, %xmm7                    ## xmm7 = xmm7[1],xmm5[1]
0000000000cb44bf	addsd	%xmm7, %xmm5
0000000000cb44c3	movsd	0x38(%r14), %xmm8
0000000000cb44c9	addsd	%xmm8, %xmm5
0000000000cb44ce	divsd	%xmm6, %xmm5
0000000000cb44d2	movddup	%xmm0, %xmm6                    ## xmm6 = xmm0[0,0]
0000000000cb44d6	mulpd	%xmm1, %xmm6
0000000000cb44da	addpd	%xmm4, %xmm6
0000000000cb44de	addpd	%xmm3, %xmm6
0000000000cb44e2	movapd	%xmm6, %xmm1
0000000000cb44e6	unpckhpd	%xmm6, %xmm1                    ## xmm1 = xmm1[1],xmm6[1]
0000000000cb44ea	mulsd	0x20(%r14), %xmm0
0000000000cb44f0	divsd	%xmm1, %xmm6
0000000000cb44f4	addsd	%xmm7, %xmm0
0000000000cb44f8	addsd	%xmm8, %xmm0
0000000000cb44fd	divsd	%xmm1, %xmm0
0000000000cb4501	movsd	%xmm2, -0x50(%rbp)
0000000000cb4506	movsd	%xmm5, -0x48(%rbp)
0000000000cb450b	movsd	%xmm6, -0x40(%rbp)
0000000000cb4510	movsd	%xmm0, -0x38(%rbp)
0000000000cb4515	movq	%r15, %rdi
0000000000cb4518	movq	%r12, %rsi
0000000000cb451b	callq	__ZNSt3__16vectorINS_4pairI9PCVector2IdES3_EENS_9allocatorIS4_EEE12emplace_backIJS4_EEERS4_DpOT_ ## std::__1::pair<PCVector2<double>, PCVector2<double>>& std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>::emplace_back<std::__1::pair<PCVector2<double>, PCVector2<double>>>(std::__1::pair<PCVector2<double>, PCVector2<double>>&&)
0000000000cb4520	movapd	-0x30(%rbp), %xmm9
0000000000cb4526	movapd	-0x60(%rbp), %xmm1
0000000000cb452b	movapd	-0x80(%rbp), %xmm2
0000000000cb4530	subsd	-0x70(%rbp), %xmm9
0000000000cb4536	ucomisd	%xmm1, %xmm9
0000000000cb453b	ja	0xcb4430
0000000000cb4541	addq	$0x60, %rsp
0000000000cb4545	popq	%rbx
0000000000cb4546	popq	%r12
0000000000cb4548	popq	%r14
0000000000cb454a	popq	%r15
0000000000cb454c	popq	%rbp
0000000000cb454d	retq
0000000000cb454e	nop
