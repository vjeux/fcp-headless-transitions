__ZN20OZObjectTrackerUtils23generateDirectionalGridERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEERKNS1_IS4_NS6_IS4_EEEER14PCMatrix44TmplIdERKS4_ddb:
0000000000cb46b0	pushq	%rbp
0000000000cb46b1	movq	%rsp, %rbp
0000000000cb46b4	pushq	%r15
0000000000cb46b6	pushq	%r14
0000000000cb46b8	pushq	%r13
0000000000cb46ba	pushq	%r12
0000000000cb46bc	pushq	%rbx
0000000000cb46bd	subq	$0x58, %rsp
0000000000cb46c1	movl	%r8d, %ebx
0000000000cb46c4	movapd	%xmm0, -0x50(%rbp)
0000000000cb46c9	movq	%rcx, %r14
0000000000cb46cc	movq	%rdx, %r15
0000000000cb46cf	movq	%rsi, %r12
0000000000cb46d2	movq	%rdi, %r13
0000000000cb46d5	xorpd	%xmm5, %xmm5
0000000000cb46d9	movapd	%xmm1, -0x40(%rbp)
0000000000cb46de	ucomisd	%xmm5, %xmm1
0000000000cb46e2	ja	0xcb4814
0000000000cb46e8	movapd	-0x40(%rbp), %xmm0
0000000000cb46ed	ucomisd	-0x50(%rbp), %xmm0
0000000000cb46f2	jbe	0xcb4b53
0000000000cb46f8	movapd	-0x40(%rbp), %xmm0
0000000000cb46fd	xorpd	0x8b856b(%rip), %xmm0
0000000000cb4705	movapd	%xmm0, -0x40(%rbp)
0000000000cb470a	movapd	0x8b855e(%rip), %xmm5
0000000000cb4712	xorpd	-0x50(%rbp), %xmm5
0000000000cb4717	jmp	0xcb4a30
0000000000cb471c	nopl	(%rax)
0000000000cb4720	movapd	%xmm1, %xmm2
0000000000cb4724	subsd	%xmm0, %xmm2
0000000000cb4728	unpcklpd	%xmm5, %xmm0                    ## xmm0 = xmm0[0],xmm5[0]
0000000000cb472c	addpd	%xmm1, %xmm0
0000000000cb4730	movapd	%xmm0, %xmm1
0000000000cb4734	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000cb4738	blendpd	$0x2, %xmm0, %xmm2              ## xmm2 = xmm2[0],xmm0[1]
0000000000cb473e	movupd	0x60(%r15), %xmm4
0000000000cb4744	movapd	%xmm2, %xmm5
0000000000cb4748	mulpd	%xmm4, %xmm5
0000000000cb474c	movapd	%xmm5, %xmm3
0000000000cb4750	unpckhpd	%xmm5, %xmm3                    ## xmm3 = xmm3[1],xmm5[1]
0000000000cb4754	addsd	%xmm5, %xmm3
0000000000cb4758	movsd	0x78(%r15), %xmm5
0000000000cb475e	addsd	%xmm5, %xmm3
0000000000cb4762	mulsd	0x68(%r15), %xmm1
0000000000cb4768	mulsd	%xmm0, %xmm4
0000000000cb476c	addsd	%xmm4, %xmm1
0000000000cb4770	addsd	%xmm5, %xmm1
0000000000cb4774	movsd	0x38(%r15), %xmm5
0000000000cb477a	movupd	(%r15), %xmm6
0000000000cb477f	movapd	%xmm6, %xmm7
0000000000cb4783	movlpd	0x20(%r15), %xmm7               ## xmm7 = mem[0],xmm7[1]
0000000000cb4789	movupd	0x20(%r15), %xmm4
0000000000cb478f	mulpd	%xmm2, %xmm7
0000000000cb4793	movhpd	0x18(%r15), %xmm5               ## xmm5 = xmm5[0],mem[0]
0000000000cb4799	blendpd	$0x2, %xmm4, %xmm6              ## xmm6 = xmm6[0],xmm4[1]
0000000000cb479f	mulpd	%xmm6, %xmm2
0000000000cb47a3	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
0000000000cb47a8	addpd	%xmm7, %xmm2
0000000000cb47ac	addpd	%xmm5, %xmm2
0000000000cb47b0	mulpd	%xmm0, %xmm6
0000000000cb47b4	movhpd	0x8(%r15), %xmm4                ## xmm4 = xmm4[0],mem[0]
0000000000cb47ba	shufpd	$0x1, %xmm6, %xmm6              ## xmm6 = xmm6[1,0]
0000000000cb47bf	mulpd	%xmm0, %xmm4
0000000000cb47c3	addpd	%xmm6, %xmm4
0000000000cb47c7	addpd	%xmm5, %xmm4
0000000000cb47cb	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
0000000000cb47d0	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
0000000000cb47d4	divpd	%xmm0, %xmm2
0000000000cb47d8	movapd	%xmm2, -0x80(%rbp)
0000000000cb47dd	shufpd	$0x1, %xmm4, %xmm4              ## xmm4 = xmm4[1,0]
0000000000cb47e2	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
0000000000cb47e6	divpd	%xmm0, %xmm4
0000000000cb47ea	movapd	%xmm4, -0x70(%rbp)
0000000000cb47ef	movq	%r13, %rdi
0000000000cb47f2	leaq	-0x80(%rbp), %rsi
0000000000cb47f6	callq	__ZNSt3__16vectorINS_4pairI9PCVector2IdES3_EENS_9allocatorIS4_EEE12emplace_backIJS4_EEERS4_DpOT_ ## std::__1::pair<PCVector2<double>, PCVector2<double>>& std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>::emplace_back<std::__1::pair<PCVector2<double>, PCVector2<double>>>(std::__1::pair<PCVector2<double>, PCVector2<double>>&&)
0000000000cb47fb	movapd	-0x60(%rbp), %xmm5
0000000000cb4800	addsd	-0x50(%rbp), %xmm5
0000000000cb4805	movapd	-0x40(%rbp), %xmm0
0000000000cb480a	ucomisd	%xmm5, %xmm0
0000000000cb480e	jbe	0xcb46e8
0000000000cb4814	movq	(%r12), %rax
0000000000cb4818	movq	0x8(%r12), %rcx
0000000000cb481d	subq	%rax, %rcx
0000000000cb4820	sarq	$0x4, %rcx
0000000000cb4824	xorpd	%xmm0, %xmm0
0000000000cb4828	cmpq	$0x2, %rcx
0000000000cb482c	jb	0xcb4900
0000000000cb4832	decq	%rcx
0000000000cb4835	testb	%bl, %bl
0000000000cb4837	je	0xcb4880
0000000000cb4839	addq	$0x18, %rax
0000000000cb483d	jmp	0xcb484d
0000000000cb483f	nop
0000000000cb4840	addq	$0x10, %rax
0000000000cb4844	decq	%rcx
0000000000cb4847	je	0xcb4900
0000000000cb484d	movsd	-0x18(%rax), %xmm2
0000000000cb4852	movsd	-0x8(%rax), %xmm1
0000000000cb4857	ucomisd	%xmm5, %xmm1
0000000000cb485b	jb	0xcb4863
0000000000cb485d	ucomisd	%xmm2, %xmm5
0000000000cb4861	jae	0xcb48bb
0000000000cb4863	ucomisd	%xmm1, %xmm5
0000000000cb4867	jb	0xcb4840
0000000000cb4869	ucomisd	%xmm5, %xmm2
0000000000cb486d	jb	0xcb4840
0000000000cb486f	jmp	0xcb48bb
0000000000cb4871	nopw	%cs:(%rax,%rax)
0000000000cb4880	addq	$0x10, %rax
0000000000cb4884	jmp	0xcb4899
0000000000cb4886	nopw	%cs:(%rax,%rax)
0000000000cb4890	addq	$0x10, %rax
0000000000cb4894	decq	%rcx
0000000000cb4897	je	0xcb4900
0000000000cb4899	movsd	-0x8(%rax), %xmm2
0000000000cb489e	movsd	0x8(%rax), %xmm1
0000000000cb48a3	ucomisd	%xmm5, %xmm1
0000000000cb48a7	jb	0xcb48af
0000000000cb48a9	ucomisd	%xmm2, %xmm5
0000000000cb48ad	jae	0xcb48bb
0000000000cb48af	ucomisd	%xmm1, %xmm5
0000000000cb48b3	jb	0xcb4890
0000000000cb48b5	ucomisd	%xmm5, %xmm2
0000000000cb48b9	jb	0xcb4890
0000000000cb48bb	movsd	(%rax), %xmm0
0000000000cb48bf	movapd	%xmm1, %xmm3
0000000000cb48c3	subsd	%xmm5, %xmm3
0000000000cb48c7	andpd	0x8b81c1(%rip), %xmm3
0000000000cb48cf	movsd	0x8b9d11(%rip), %xmm4
0000000000cb48d7	ucomisd	%xmm3, %xmm4
0000000000cb48db	ja	0xcb4900
0000000000cb48dd	movsd	-0x10(%rax), %xmm3
0000000000cb48e2	movapd	%xmm5, %xmm4
0000000000cb48e6	subsd	%xmm2, %xmm4
0000000000cb48ea	subsd	%xmm2, %xmm1
0000000000cb48ee	divsd	%xmm1, %xmm4
0000000000cb48f2	subsd	%xmm3, %xmm0
0000000000cb48f6	mulsd	%xmm4, %xmm0
0000000000cb48fa	addsd	%xmm3, %xmm0
0000000000cb48fe	nop
0000000000cb4900	movupd	(%r14), %xmm1
0000000000cb4905	testb	%bl, %bl
0000000000cb4907	movapd	%xmm5, -0x60(%rbp)
0000000000cb490c	je	0xcb4720
0000000000cb4912	movapd	%xmm5, %xmm2
0000000000cb4916	unpcklpd	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
0000000000cb491a	addpd	%xmm1, %xmm2
0000000000cb491e	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
0000000000cb4922	subsd	%xmm0, %xmm1
0000000000cb4926	movapd	%xmm2, %xmm0
0000000000cb492a	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000cb492e	jmp	0xcb473e
0000000000cb4933	nopw	%cs:(%rax,%rax)
0000000000cb4940	movapd	%xmm1, %xmm2
0000000000cb4944	subsd	%xmm0, %xmm2
0000000000cb4948	unpcklpd	%xmm5, %xmm0                    ## xmm0 = xmm0[0],xmm5[0]
0000000000cb494c	addpd	%xmm1, %xmm0
0000000000cb4950	movapd	%xmm0, %xmm1
0000000000cb4954	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000cb4958	blendpd	$0x2, %xmm0, %xmm2              ## xmm2 = xmm2[0],xmm0[1]
0000000000cb495e	movupd	0x60(%r15), %xmm4
0000000000cb4964	movapd	%xmm2, %xmm5
0000000000cb4968	mulpd	%xmm4, %xmm5
0000000000cb496c	movapd	%xmm5, %xmm3
0000000000cb4970	unpckhpd	%xmm5, %xmm3                    ## xmm3 = xmm3[1],xmm5[1]
0000000000cb4974	addsd	%xmm5, %xmm3
0000000000cb4978	movsd	0x78(%r15), %xmm5
0000000000cb497e	addsd	%xmm5, %xmm3
0000000000cb4982	mulsd	0x68(%r15), %xmm1
0000000000cb4988	mulsd	%xmm0, %xmm4
0000000000cb498c	addsd	%xmm4, %xmm1
0000000000cb4990	addsd	%xmm5, %xmm1
0000000000cb4994	movsd	0x38(%r15), %xmm5
0000000000cb499a	movupd	(%r15), %xmm6
0000000000cb499f	movapd	%xmm6, %xmm7
0000000000cb49a3	movlpd	0x20(%r15), %xmm7               ## xmm7 = mem[0],xmm7[1]
0000000000cb49a9	movupd	0x20(%r15), %xmm4
0000000000cb49af	mulpd	%xmm2, %xmm7
0000000000cb49b3	movhpd	0x18(%r15), %xmm5               ## xmm5 = xmm5[0],mem[0]
0000000000cb49b9	blendpd	$0x2, %xmm4, %xmm6              ## xmm6 = xmm6[0],xmm4[1]
0000000000cb49bf	mulpd	%xmm6, %xmm2
0000000000cb49c3	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
0000000000cb49c8	addpd	%xmm7, %xmm2
0000000000cb49cc	addpd	%xmm5, %xmm2
0000000000cb49d0	mulpd	%xmm0, %xmm6
0000000000cb49d4	movhpd	0x8(%r15), %xmm4                ## xmm4 = xmm4[0],mem[0]
0000000000cb49da	shufpd	$0x1, %xmm6, %xmm6              ## xmm6 = xmm6[1,0]
0000000000cb49df	mulpd	%xmm0, %xmm4
0000000000cb49e3	addpd	%xmm6, %xmm4
0000000000cb49e7	addpd	%xmm5, %xmm4
0000000000cb49eb	shufpd	$0x1, %xmm2, %xmm2              ## xmm2 = xmm2[1,0]
0000000000cb49f0	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
0000000000cb49f4	divpd	%xmm0, %xmm2
0000000000cb49f8	movapd	%xmm2, -0x80(%rbp)
0000000000cb49fd	shufpd	$0x1, %xmm4, %xmm4              ## xmm4 = xmm4[1,0]
0000000000cb4a02	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
0000000000cb4a06	divpd	%xmm0, %xmm4
0000000000cb4a0a	movapd	%xmm4, -0x70(%rbp)
0000000000cb4a0f	movq	%r13, %rdi
0000000000cb4a12	leaq	-0x80(%rbp), %rsi
0000000000cb4a16	callq	__ZNSt3__16vectorINS_4pairI9PCVector2IdES3_EENS_9allocatorIS4_EEE12emplace_backIJS4_EEERS4_DpOT_ ## std::__1::pair<PCVector2<double>, PCVector2<double>>& std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>::emplace_back<std::__1::pair<PCVector2<double>, PCVector2<double>>>(std::__1::pair<PCVector2<double>, PCVector2<double>>&&)
0000000000cb4a1b	movapd	-0x60(%rbp), %xmm5
0000000000cb4a20	subsd	-0x50(%rbp), %xmm5
0000000000cb4a25	ucomisd	-0x40(%rbp), %xmm5
0000000000cb4a2a	jbe	0xcb4b53
0000000000cb4a30	movq	(%r12), %rax
0000000000cb4a34	movq	0x8(%r12), %rcx
0000000000cb4a39	subq	%rax, %rcx
0000000000cb4a3c	sarq	$0x4, %rcx
0000000000cb4a40	xorpd	%xmm0, %xmm0
0000000000cb4a44	cmpq	$0x2, %rcx
0000000000cb4a48	jb	0xcb4b20
0000000000cb4a4e	decq	%rcx
0000000000cb4a51	testb	%bl, %bl
0000000000cb4a53	je	0xcb4aa0
0000000000cb4a55	addq	$0x18, %rax
0000000000cb4a59	jmp	0xcb4a6d
0000000000cb4a5b	nopl	(%rax,%rax)
0000000000cb4a60	addq	$0x10, %rax
0000000000cb4a64	decq	%rcx
0000000000cb4a67	je	0xcb4b20
0000000000cb4a6d	movsd	-0x18(%rax), %xmm2
0000000000cb4a72	movsd	-0x8(%rax), %xmm1
0000000000cb4a77	ucomisd	%xmm5, %xmm1
0000000000cb4a7b	jb	0xcb4a83
0000000000cb4a7d	ucomisd	%xmm2, %xmm5
0000000000cb4a81	jae	0xcb4adb
0000000000cb4a83	ucomisd	%xmm1, %xmm5
0000000000cb4a87	jb	0xcb4a60
0000000000cb4a89	ucomisd	%xmm5, %xmm2
0000000000cb4a8d	jb	0xcb4a60
0000000000cb4a8f	jmp	0xcb4adb
0000000000cb4a91	nopw	%cs:(%rax,%rax)
0000000000cb4aa0	addq	$0x10, %rax
0000000000cb4aa4	jmp	0xcb4ab9
0000000000cb4aa6	nopw	%cs:(%rax,%rax)
0000000000cb4ab0	addq	$0x10, %rax
0000000000cb4ab4	decq	%rcx
0000000000cb4ab7	je	0xcb4b20
0000000000cb4ab9	movsd	-0x8(%rax), %xmm2
0000000000cb4abe	movsd	0x8(%rax), %xmm1
0000000000cb4ac3	ucomisd	%xmm5, %xmm1
0000000000cb4ac7	jb	0xcb4acf
0000000000cb4ac9	ucomisd	%xmm2, %xmm5
0000000000cb4acd	jae	0xcb4adb
0000000000cb4acf	ucomisd	%xmm1, %xmm5
0000000000cb4ad3	jb	0xcb4ab0
0000000000cb4ad5	ucomisd	%xmm5, %xmm2
0000000000cb4ad9	jb	0xcb4ab0
0000000000cb4adb	movsd	(%rax), %xmm0
0000000000cb4adf	movapd	%xmm1, %xmm3
0000000000cb4ae3	subsd	%xmm5, %xmm3
0000000000cb4ae7	andpd	0x8b7fa1(%rip), %xmm3
0000000000cb4aef	movsd	0x8b9af1(%rip), %xmm4
0000000000cb4af7	ucomisd	%xmm3, %xmm4
0000000000cb4afb	ja	0xcb4b20
0000000000cb4afd	movsd	-0x10(%rax), %xmm3
0000000000cb4b02	movapd	%xmm5, %xmm4
0000000000cb4b06	subsd	%xmm2, %xmm4
0000000000cb4b0a	subsd	%xmm2, %xmm1
0000000000cb4b0e	divsd	%xmm1, %xmm4
0000000000cb4b12	subsd	%xmm3, %xmm0
0000000000cb4b16	mulsd	%xmm4, %xmm0
0000000000cb4b1a	addsd	%xmm3, %xmm0
0000000000cb4b1e	nop
0000000000cb4b20	movupd	(%r14), %xmm1
0000000000cb4b25	testb	%bl, %bl
0000000000cb4b27	movapd	%xmm5, -0x60(%rbp)
0000000000cb4b2c	je	0xcb4940
0000000000cb4b32	movapd	%xmm5, %xmm2
0000000000cb4b36	unpcklpd	%xmm0, %xmm2                    ## xmm2 = xmm2[0],xmm0[0]
0000000000cb4b3a	addpd	%xmm1, %xmm2
0000000000cb4b3e	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
0000000000cb4b42	subsd	%xmm0, %xmm1
0000000000cb4b46	movapd	%xmm2, %xmm0
0000000000cb4b4a	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000cb4b4e	jmp	0xcb495e
0000000000cb4b53	addq	$0x58, %rsp
0000000000cb4b57	popq	%rbx
0000000000cb4b58	popq	%r12
0000000000cb4b5a	popq	%r13
0000000000cb4b5c	popq	%r14
0000000000cb4b5e	popq	%r15
0000000000cb4b60	popq	%rbp
0000000000cb4b61	retq
0000000000cb4b62	nopw	%cs:(%rax,%rax)
