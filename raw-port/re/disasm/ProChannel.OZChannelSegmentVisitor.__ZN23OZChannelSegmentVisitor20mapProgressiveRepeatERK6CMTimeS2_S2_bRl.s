__ZN23OZChannelSegmentVisitor20mapProgressiveRepeatERK6CMTimeS2_S2_bRl:
00000000000a4702	pushq	%rbp
00000000000a4703	movq	%rsp, %rbp
00000000000a4706	pushq	%r15
00000000000a4708	pushq	%r14
00000000000a470a	pushq	%r13
00000000000a470c	pushq	%r12
00000000000a470e	pushq	%rbx
00000000000a470f	subq	$0x108, %rsp                    ## imm = 0x108
00000000000a4716	movq	%r9, %r12
00000000000a4719	movl	%r8d, -0x7c(%rbp)
00000000000a471d	movq	%rdx, %r15
00000000000a4720	movq	%rsi, %r13
00000000000a4723	movq	%rdi, %r14
00000000000a4726	movq	0x10(%rcx), %rax
00000000000a472a	movq	%rax, -0x50(%rbp)
00000000000a472e	movq	%rcx, -0x68(%rbp)
00000000000a4732	movups	(%rcx), %xmm0
00000000000a4735	movaps	%xmm0, -0x60(%rbp)
00000000000a4739	movq	0x10(%rdx), %rax
00000000000a473d	movq	%rax, -0x30(%rbp)
00000000000a4741	movups	(%rdx), %xmm0
00000000000a4744	movaps	%xmm0, -0x40(%rbp)
00000000000a4748	movq	-0x30(%rbp), %rax
00000000000a474c	movq	%rax, 0x28(%rsp)
00000000000a4751	movaps	-0x40(%rbp), %xmm0
00000000000a4755	movups	%xmm0, 0x18(%rsp)
00000000000a475a	movq	-0x50(%rbp), %rax
00000000000a475e	movq	%rax, 0x10(%rsp)
00000000000a4763	movaps	-0x60(%rbp), %xmm0
00000000000a4767	movups	%xmm0, (%rsp)
00000000000a476b	leaq	-0x98(%rbp), %rbx
00000000000a4772	movq	%rbx, %rdi
00000000000a4775	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a477a	movq	0x25d3f(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
00000000000a4781	movq	0x10(%rax), %rcx
00000000000a4785	movq	%rcx, -0x50(%rbp)
00000000000a4789	movups	(%rax), %xmm0
00000000000a478c	movaps	%xmm0, -0x60(%rbp)
00000000000a4790	movq	-0x50(%rbp), %rax
00000000000a4794	movq	%rax, 0x28(%rsp)
00000000000a4799	movaps	-0x60(%rbp), %xmm0
00000000000a479d	movups	%xmm0, 0x18(%rsp)
00000000000a47a2	movq	0x10(%rbx), %rax
00000000000a47a6	movq	%rax, 0x10(%rsp)
00000000000a47ab	movups	(%rbx), %xmm0
00000000000a47ae	movups	%xmm0, (%rsp)
00000000000a47b2	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a47b7	testl	%eax, %eax
00000000000a47b9	je	0xa4a60
00000000000a47bf	movq	%r12, -0x70(%rbp)
00000000000a47c3	movq	%r14, -0x78(%rbp)
00000000000a47c7	movq	0x10(%r13), %rax
00000000000a47cb	movq	%rax, -0x50(%rbp)
00000000000a47cf	movups	(%r13), %xmm0
00000000000a47d4	movaps	%xmm0, -0x60(%rbp)
00000000000a47d8	movq	0x10(%r15), %rax
00000000000a47dc	movq	%rax, -0x30(%rbp)
00000000000a47e0	movups	(%r15), %xmm0
00000000000a47e4	movaps	%xmm0, -0x40(%rbp)
00000000000a47e8	movq	-0x30(%rbp), %rax
00000000000a47ec	movq	%rax, 0x28(%rsp)
00000000000a47f1	movaps	-0x40(%rbp), %xmm0
00000000000a47f5	movups	%xmm0, 0x18(%rsp)
00000000000a47fa	movq	-0x50(%rbp), %rax
00000000000a47fe	movq	%rax, 0x10(%rsp)
00000000000a4803	movaps	-0x60(%rbp), %xmm0
00000000000a4807	movups	%xmm0, (%rsp)
00000000000a480b	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a4810	testl	%eax, %eax
00000000000a4812	movq	%r13, %rbx
00000000000a4815	js	0xa4a7f
00000000000a481b	movq	0x10(%rbx), %rax
00000000000a481f	movq	%rax, -0x50(%rbp)
00000000000a4823	movups	(%rbx), %xmm0
00000000000a4826	movaps	%xmm0, -0x60(%rbp)
00000000000a482a	movq	-0x68(%rbp), %r14
00000000000a482e	movq	0x10(%r14), %rax
00000000000a4832	movq	%rax, -0x30(%rbp)
00000000000a4836	movups	(%r14), %xmm0
00000000000a483a	movaps	%xmm0, -0x40(%rbp)
00000000000a483e	movq	-0x30(%rbp), %rax
00000000000a4842	movq	%rax, 0x28(%rsp)
00000000000a4847	movaps	-0x40(%rbp), %xmm0
00000000000a484b	movups	%xmm0, 0x18(%rsp)
00000000000a4850	movq	-0x50(%rbp), %rax
00000000000a4854	movq	%rax, 0x10(%rsp)
00000000000a4859	movaps	-0x60(%rbp), %xmm0
00000000000a485d	movups	%xmm0, (%rsp)
00000000000a4861	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a4866	testl	%eax, %eax
00000000000a4868	jle	0xa4c93
00000000000a486e	movq	0x10(%rbx), %rax
00000000000a4872	leaq	-0x60(%rbp), %r13
00000000000a4876	movq	%rax, 0x10(%r13)
00000000000a487a	movups	(%rbx), %xmm0
00000000000a487d	movaps	%xmm0, (%r13)
00000000000a4882	movq	0x10(%r15), %rax
00000000000a4886	leaq	-0x40(%rbp), %rcx
00000000000a488a	movq	%rax, 0x10(%rcx)
00000000000a488e	movups	(%r15), %xmm0
00000000000a4892	movaps	%xmm0, (%rcx)
00000000000a4895	movq	0x10(%rcx), %rax
00000000000a4899	movq	%rax, 0x28(%rsp)
00000000000a489e	movaps	(%rcx), %xmm0
00000000000a48a1	movups	%xmm0, 0x18(%rsp)
00000000000a48a6	movq	0x10(%r13), %rax
00000000000a48aa	movq	%rax, 0x10(%rsp)
00000000000a48af	movaps	(%r13), %xmm0
00000000000a48b4	movups	%xmm0, (%rsp)
00000000000a48b8	leaq	-0x100(%rbp), %r14
00000000000a48bf	movq	%r14, %rdi
00000000000a48c2	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a48c7	movq	%rbx, %r12
00000000000a48ca	leaq	-0xd0(%rbp), %rbx
00000000000a48d1	leaq	-0x98(%rbp), %rdx
00000000000a48d8	movq	%rbx, %rdi
00000000000a48db	movq	%r14, %rsi
00000000000a48de	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
00000000000a48e3	leaq	-0xe8(%rbp), %r14
00000000000a48ea	movl	$0x1, %esi
00000000000a48ef	movq	%r14, %rdi
00000000000a48f2	movl	$0x1, %edx
00000000000a48f7	callq	0xaca92                         ## symbol stub for: _CMTimeMake
00000000000a48fc	movq	0x10(%r14), %rax
00000000000a4900	movq	%rax, 0x28(%rsp)
00000000000a4905	movups	(%r14), %xmm0
00000000000a4909	movups	%xmm0, 0x18(%rsp)
00000000000a490e	movq	0x10(%rbx), %rax
00000000000a4912	movq	%rax, 0x10(%rsp)
00000000000a4917	movaps	(%rbx), %xmm0
00000000000a491a	movups	%xmm0, (%rsp)
00000000000a491e	leaq	-0xb0(%rbp), %r14
00000000000a4925	movq	%r14, %rdi
00000000000a4928	callq	0xacace                         ## symbol stub for: _PC_CMTimeFloorToSampleDuration
00000000000a492d	movq	0x10(%r14), %rax
00000000000a4931	movq	%rax, 0x28(%rsp)
00000000000a4936	movups	(%r14), %xmm0
00000000000a493a	movups	%xmm0, 0x18(%rsp)
00000000000a493f	movq	0x10(%rbx), %rax
00000000000a4943	movq	%rax, 0x10(%rsp)
00000000000a4948	movaps	(%rbx), %xmm0
00000000000a494b	movups	%xmm0, (%rsp)
00000000000a494f	leaq	-0x40(%rbp), %r14
00000000000a4953	movq	%r14, %rdi
00000000000a4956	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a495b	movq	%r13, %rdi
00000000000a495e	movq	%r14, %rsi
00000000000a4961	leaq	-0x98(%rbp), %rdx
00000000000a4968	callq	0xace22                         ## symbol stub for: __ZmlRK6CMTimeS1_
00000000000a496d	movq	0x10(%r13), %rax
00000000000a4971	movq	%rax, 0x10(%rbx)
00000000000a4975	movups	(%r13), %xmm0
00000000000a497a	movaps	%xmm0, (%rbx)
00000000000a497d	movq	0x10(%r15), %rax
00000000000a4981	movq	%rax, 0x10(%r13)
00000000000a4985	movups	(%r15), %xmm0
00000000000a4989	movaps	%xmm0, (%r13)
00000000000a498e	movq	0x10(%rbx), %rax
00000000000a4992	movq	%rax, 0x28(%rsp)
00000000000a4997	movaps	(%rbx), %xmm0
00000000000a499a	movups	%xmm0, 0x18(%rsp)
00000000000a499f	movq	0x10(%r13), %rax
00000000000a49a3	movq	%rax, 0x10(%rsp)
00000000000a49a8	movaps	(%r13), %xmm0
00000000000a49ad	movups	%xmm0, (%rsp)
00000000000a49b1	movq	-0x78(%rbp), %r14
00000000000a49b5	movq	%r14, %rdi
00000000000a49b8	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000a49bd	movq	0x10(%r12), %rax
00000000000a49c2	movq	%rax, 0x10(%r13)
00000000000a49c6	movups	(%r12), %xmm0
00000000000a49cb	movaps	%xmm0, (%r13)
00000000000a49d0	movq	0x10(%r15), %rax
00000000000a49d4	leaq	-0x40(%rbp), %rcx
00000000000a49d8	movq	%rax, 0x10(%rcx)
00000000000a49dc	movups	(%r15), %xmm0
00000000000a49e0	movaps	%xmm0, (%rcx)
00000000000a49e3	movq	0x10(%rcx), %rax
00000000000a49e7	movq	%rax, 0x28(%rsp)
00000000000a49ec	movaps	(%rcx), %xmm0
00000000000a49ef	movups	%xmm0, 0x18(%rsp)
00000000000a49f4	movq	0x10(%r13), %rax
00000000000a49f8	movq	%rax, 0x10(%rsp)
00000000000a49fd	movaps	(%r13), %xmm0
00000000000a4a02	movups	%xmm0, (%rsp)
00000000000a4a06	leaq	-0xb0(%rbp), %rbx
00000000000a4a0d	movq	%rbx, %rdi
00000000000a4a10	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4a15	movq	0x10(%rbx), %rax
00000000000a4a19	movq	%rax, 0x10(%rsp)
00000000000a4a1e	movups	(%rbx), %xmm0
00000000000a4a21	movups	%xmm0, (%rsp)
00000000000a4a25	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000a4a2a	movsd	%xmm0, -0x68(%rbp)
00000000000a4a2f	leaq	-0x98(%rbp), %rcx
00000000000a4a36	movq	0x10(%rcx), %rax
00000000000a4a3a	movq	%rax, 0x10(%rsp)
00000000000a4a3f	movupd	(%rcx), %xmm0
00000000000a4a43	movupd	%xmm0, (%rsp)
00000000000a4a48	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000a4a4d	movsd	-0x68(%rbp), %xmm1
00000000000a4a52	divsd	%xmm0, %xmm1
00000000000a4a56	cvttsd2si	%xmm1, %rax
00000000000a4a5b	jmp	0xa4c77
00000000000a4a60	movq	$0x0, (%r12)
00000000000a4a68	movq	0x10(%r15), %rax
00000000000a4a6c	movq	%rax, 0x10(%r14)
00000000000a4a70	movupd	(%r15), %xmm0
00000000000a4a75	movupd	%xmm0, (%r14)
00000000000a4a7a	jmp	0xa4c7e
00000000000a4a7f	movq	0x10(%r15), %rax
00000000000a4a83	leaq	-0x60(%rbp), %r14
00000000000a4a87	movq	%rax, 0x10(%r14)
00000000000a4a8b	movups	(%r15), %xmm0
00000000000a4a8f	movaps	%xmm0, (%r14)
00000000000a4a93	movq	0x10(%rbx), %rax
00000000000a4a97	leaq	-0x40(%rbp), %rcx
00000000000a4a9b	movq	%rax, 0x10(%rcx)
00000000000a4a9f	movups	(%rbx), %xmm0
00000000000a4aa2	movaps	%xmm0, (%rcx)
00000000000a4aa5	movq	0x10(%rcx), %rax
00000000000a4aa9	movq	%rax, 0x28(%rsp)
00000000000a4aae	movaps	(%rcx), %xmm0
00000000000a4ab1	movups	%xmm0, 0x18(%rsp)
00000000000a4ab6	movq	0x10(%r14), %rax
00000000000a4aba	movq	%rax, 0x10(%rsp)
00000000000a4abf	movaps	(%r14), %xmm0
00000000000a4ac3	movups	%xmm0, (%rsp)
00000000000a4ac7	leaq	-0x100(%rbp), %r12
00000000000a4ace	movq	%r12, %rdi
00000000000a4ad1	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4ad6	leaq	-0xd0(%rbp), %r13
00000000000a4add	leaq	-0x98(%rbp), %rdx
00000000000a4ae4	movq	%r13, %rdi
00000000000a4ae7	movq	%r12, %rsi
00000000000a4aea	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
00000000000a4aef	leaq	-0xe8(%rbp), %r12
00000000000a4af6	movl	$0x1, %esi
00000000000a4afb	movq	%r12, %rdi
00000000000a4afe	movl	$0x1, %edx
00000000000a4b03	callq	0xaca92                         ## symbol stub for: _CMTimeMake
00000000000a4b08	movq	0x10(%r12), %rax
00000000000a4b0d	movq	%rax, 0x28(%rsp)
00000000000a4b12	movups	(%r12), %xmm0
00000000000a4b17	movups	%xmm0, 0x18(%rsp)
00000000000a4b1c	movq	0x10(%r13), %rax
00000000000a4b20	movq	%rax, 0x10(%rsp)
00000000000a4b25	movaps	(%r13), %xmm0
00000000000a4b2a	movups	%xmm0, (%rsp)
00000000000a4b2e	movq	%rbx, %r12
00000000000a4b31	leaq	-0xb0(%rbp), %rbx
00000000000a4b38	movq	%rbx, %rdi
00000000000a4b3b	callq	0xacace                         ## symbol stub for: _PC_CMTimeFloorToSampleDuration
00000000000a4b40	movq	0x10(%rbx), %rax
00000000000a4b44	movq	%rax, 0x28(%rsp)
00000000000a4b49	movups	(%rbx), %xmm0
00000000000a4b4c	movups	%xmm0, 0x18(%rsp)
00000000000a4b51	movq	0x10(%r13), %rax
00000000000a4b55	movq	%rax, 0x10(%rsp)
00000000000a4b5a	movaps	(%r13), %xmm0
00000000000a4b5f	movups	%xmm0, (%rsp)
00000000000a4b63	leaq	-0x40(%rbp), %rbx
00000000000a4b67	movq	%rbx, %rdi
00000000000a4b6a	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4b6f	movq	%r14, %rdi
00000000000a4b72	movq	%rbx, %rsi
00000000000a4b75	leaq	-0x98(%rbp), %rdx
00000000000a4b7c	callq	0xace22                         ## symbol stub for: __ZmlRK6CMTimeS1_
00000000000a4b81	movq	0x10(%r14), %rax
00000000000a4b85	movq	%rax, 0x10(%r13)
00000000000a4b89	movups	(%r14), %xmm0
00000000000a4b8d	movaps	%xmm0, (%r13)
00000000000a4b92	movq	-0x68(%rbp), %rcx
00000000000a4b96	movq	0x10(%rcx), %rax
00000000000a4b9a	movq	%rax, 0x10(%r14)
00000000000a4b9e	movups	(%rcx), %xmm0
00000000000a4ba1	movaps	%xmm0, (%r14)
00000000000a4ba5	movq	0x10(%r13), %rax
00000000000a4ba9	movq	%rax, 0x28(%rsp)
00000000000a4bae	movaps	(%r13), %xmm0
00000000000a4bb3	movups	%xmm0, 0x18(%rsp)
00000000000a4bb8	movq	0x10(%r14), %rax
00000000000a4bbc	movq	%rax, 0x10(%rsp)
00000000000a4bc1	movaps	(%r14), %xmm0
00000000000a4bc5	movups	%xmm0, (%rsp)
00000000000a4bc9	movq	-0x78(%rbp), %rbx
00000000000a4bcd	movq	%rbx, %rdi
00000000000a4bd0	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4bd5	movq	0x10(%r15), %rax
00000000000a4bd9	movq	%rax, 0x10(%r14)
00000000000a4bdd	movups	(%r15), %xmm0
00000000000a4be1	movaps	%xmm0, (%r14)
00000000000a4be5	movq	0x10(%r12), %rax
00000000000a4bea	leaq	-0x40(%rbp), %rcx
00000000000a4bee	movq	%rax, 0x10(%rcx)
00000000000a4bf2	movups	(%r12), %xmm0
00000000000a4bf7	movaps	%xmm0, (%rcx)
00000000000a4bfa	movq	0x10(%rcx), %rax
00000000000a4bfe	movq	%rax, 0x28(%rsp)
00000000000a4c03	movaps	(%rcx), %xmm0
00000000000a4c06	movups	%xmm0, 0x18(%rsp)
00000000000a4c0b	movq	0x10(%r14), %rax
00000000000a4c0f	movq	%rax, 0x10(%rsp)
00000000000a4c14	movaps	(%r14), %xmm0
00000000000a4c18	movq	%rbx, %r14
00000000000a4c1b	movups	%xmm0, (%rsp)
00000000000a4c1f	leaq	-0xb0(%rbp), %rbx
00000000000a4c26	movq	%rbx, %rdi
00000000000a4c29	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4c2e	movq	0x10(%rbx), %rax
00000000000a4c32	movq	%rax, 0x10(%rsp)
00000000000a4c37	movups	(%rbx), %xmm0
00000000000a4c3a	movups	%xmm0, (%rsp)
00000000000a4c3e	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000a4c43	movsd	%xmm0, -0x68(%rbp)
00000000000a4c48	leaq	-0x98(%rbp), %rcx
00000000000a4c4f	movq	0x10(%rcx), %rax
00000000000a4c53	movq	%rax, 0x10(%rsp)
00000000000a4c58	movupd	(%rcx), %xmm0
00000000000a4c5c	movupd	%xmm0, (%rsp)
00000000000a4c61	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000a4c66	movsd	-0x68(%rbp), %xmm1
00000000000a4c6b	divsd	%xmm0, %xmm1
00000000000a4c6f	cvttsd2si	%xmm1, %rax
00000000000a4c74	incq	%rax
00000000000a4c77	movq	-0x70(%rbp), %rcx
00000000000a4c7b	movq	%rax, (%rcx)
00000000000a4c7e	movq	%r14, %rax
00000000000a4c81	addq	$0x108, %rsp                    ## imm = 0x108
00000000000a4c88	popq	%rbx
00000000000a4c89	popq	%r12
00000000000a4c8b	popq	%r13
00000000000a4c8d	popq	%r14
00000000000a4c8f	popq	%r15
00000000000a4c91	popq	%rbp
00000000000a4c92	retq
00000000000a4c93	cmpb	$0x0, -0x7c(%rbp)
00000000000a4c97	je	0xa4ce8
00000000000a4c99	movq	0x10(%rbx), %rax
00000000000a4c9d	movq	%rax, -0x50(%rbp)
00000000000a4ca1	movups	(%rbx), %xmm0
00000000000a4ca4	movaps	%xmm0, -0x60(%rbp)
00000000000a4ca8	movq	0x10(%r14), %rax
00000000000a4cac	movq	%rax, -0x30(%rbp)
00000000000a4cb0	movups	(%r14), %xmm0
00000000000a4cb4	movaps	%xmm0, -0x40(%rbp)
00000000000a4cb8	movq	-0x30(%rbp), %rax
00000000000a4cbc	movq	%rax, 0x28(%rsp)
00000000000a4cc1	movaps	-0x40(%rbp), %xmm0
00000000000a4cc5	movups	%xmm0, 0x18(%rsp)
00000000000a4cca	movq	-0x50(%rbp), %rax
00000000000a4cce	movq	%rax, 0x10(%rsp)
00000000000a4cd3	movaps	-0x60(%rbp), %xmm0
00000000000a4cd7	movups	%xmm0, (%rsp)
00000000000a4cdb	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a4ce0	testl	%eax, %eax
00000000000a4ce2	jns	0xa486e
00000000000a4ce8	movq	0x10(%rbx), %rax
00000000000a4cec	movq	-0x78(%rbp), %r14
00000000000a4cf0	movq	%rax, 0x10(%r14)
00000000000a4cf4	movupd	(%rbx), %xmm0
00000000000a4cf8	movupd	%xmm0, (%r14)
00000000000a4cfd	movq	-0x70(%rbp), %rax
00000000000a4d01	movq	$0x0, (%rax)
00000000000a4d08	jmp	0xa4c7e
00000000000a4d0d	addb	%dl, 0x48(%rbp)
00000000000a4d10	movl	%esp, %ebp
00000000000a4d12	pushq	%r15
00000000000a4d14	pushq	%r14
00000000000a4d16	pushq	%r13
00000000000a4d18	pushq	%r12
00000000000a4d1a	pushq	%rbx
00000000000a4d1b	subq	$0x78, %rsp
00000000000a4d1f	movq	%r9, %r12
00000000000a4d22	movq	%r8, %r14
00000000000a4d25	movq	%rcx, %r13
00000000000a4d28	movq	%rdi, %rbx
00000000000a4d2b	movq	(%r8), %rax
00000000000a4d2e	movq	0x2578b(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000a4d35	movq	%r8, %rdi
00000000000a4d38	callq	*0x28(%rax)
00000000000a4d3b	movsd	0xb8ad(%rip), %xmm1
00000000000a4d43	subsd	%xmm0, %xmm1
00000000000a4d47	mulsd	0xb671(%rip), %xmm1
00000000000a4d4f	movsd	%xmm1, -0x38(%rbp)
00000000000a4d54	movq	0x10(%r13), %rax
00000000000a4d58	leaq	-0x70(%rbp), %r15
00000000000a4d5c	movq	%rax, 0x10(%r15)
00000000000a4d60	movups	(%r13), %xmm0
00000000000a4d65	movaps	%xmm0, (%r15)
00000000000a4d69	movq	0x20(%r14), %rax
00000000000a4d6d	movq	%rax, 0x28(%rsp)
00000000000a4d72	movups	0x10(%r14), %xmm0
00000000000a4d77	movups	%xmm0, 0x18(%rsp)
00000000000a4d7c	movq	0x10(%r15), %rax
00000000000a4d80	movq	%rax, 0x10(%rsp)
00000000000a4d85	movaps	(%r15), %xmm0
00000000000a4d89	movups	%xmm0, (%rsp)
00000000000a4d8d	leaq	-0x58(%rbp), %r13
00000000000a4d91	movq	%r13, %rdi
00000000000a4d94	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4d99	movq	0x10(%r13), %rax
00000000000a4d9d	movq	%rax, 0x10(%rsp)
00000000000a4da2	movups	(%r13), %xmm0
00000000000a4da7	movups	%xmm0, (%rsp)
00000000000a4dab	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000a4db0	movsd	%xmm0, -0x30(%rbp)
00000000000a4db5	movq	0x20(%r14), %rax
00000000000a4db9	movq	%rax, 0x28(%rsp)
00000000000a4dbe	movups	0x10(%r14), %xmm0
00000000000a4dc3	movups	%xmm0, 0x18(%rsp)
00000000000a4dc8	movq	0x20(%r12), %rax
00000000000a4dcd	movq	%rax, 0x10(%rsp)
00000000000a4dd2	movups	0x10(%r12), %xmm0
00000000000a4dd8	movups	%xmm0, (%rsp)
00000000000a4ddc	movq	%r15, %rdi
00000000000a4ddf	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4de4	movq	0x10(%r15), %rax
00000000000a4de8	movq	%rax, 0x10(%rsp)
00000000000a4ded	movupd	(%r15), %xmm0
00000000000a4df2	movupd	%xmm0, (%rsp)
00000000000a4df7	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000a4dfc	movsd	-0x30(%rbp), %xmm1
00000000000a4e01	divsd	%xmm0, %xmm1
00000000000a4e05	leaq	-0x40(%rbp), %r12
00000000000a4e09	movq	$0x0, (%r12)
00000000000a4e11	movsd	0xa70f(%rip), %xmm4
00000000000a4e19	xorps	%xmm2, %xmm2
00000000000a4e1c	xorps	%xmm3, %xmm3
00000000000a4e1f	movapd	%xmm1, %xmm0
00000000000a4e23	movsd	-0x38(%rbp), %xmm1
00000000000a4e28	movq	%r12, %rdi
00000000000a4e2b	xorl	%esi, %esi
00000000000a4e2d	callq	0xacc72                         ## symbol stub for: __ZN6PCMath9easeInOutEdddddPdS0_
00000000000a4e32	movsd	(%r12), %xmm0
00000000000a4e38	leaq	-0x58(%rbp), %r12
00000000000a4e3c	movq	%r12, %rdi
00000000000a4e3f	movq	%r15, %rsi
00000000000a4e42	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
00000000000a4e47	movq	0x20(%r14), %rax
00000000000a4e4b	movq	%rax, 0x28(%rsp)
00000000000a4e50	movups	0x10(%r14), %xmm0
00000000000a4e55	movups	%xmm0, 0x18(%rsp)
00000000000a4e5a	movq	0x10(%r12), %rax
00000000000a4e5f	movq	%rax, 0x10(%rsp)
00000000000a4e64	movups	(%r12), %xmm0
00000000000a4e69	movups	%xmm0, (%rsp)
00000000000a4e6d	movq	%rbx, %rdi
00000000000a4e70	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000a4e75	movq	%rbx, %rax
00000000000a4e78	addq	$0x78, %rsp
00000000000a4e7c	popq	%rbx
00000000000a4e7d	popq	%r12
00000000000a4e7f	popq	%r13
00000000000a4e81	popq	%r14
00000000000a4e83	popq	%r15
00000000000a4e85	popq	%rbp
00000000000a4e86	retq
00000000000a4e87	nop
