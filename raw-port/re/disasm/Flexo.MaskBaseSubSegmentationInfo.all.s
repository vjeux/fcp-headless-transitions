__ZN27MaskBaseSubSegmentationInfoC1Ev:
0000000000609610	pushq	%rbp
0000000000609611	movq	%rsp, %rbp
0000000000609614	movb	$0x0, (%rdi)
0000000000609617	movq	$0x0, 0x8(%rdi)
000000000060961f	movq	0x12e1ed2(%rip), %rax           ## literal pool symbol address: _kPC_CMTimeRangeInfinite
0000000000609626	movups	(%rax), %xmm0
0000000000609629	movups	0x10(%rax), %xmm1
000000000060962d	movups	0x20(%rax), %xmm2
0000000000609631	movups	%xmm0, 0x10(%rdi)
0000000000609635	movups	%xmm1, 0x20(%rdi)
0000000000609639	movups	%xmm2, 0x30(%rdi)
000000000060963d	movq	$0x0, 0x40(%rdi)
0000000000609645	popq	%rbp
0000000000609646	retq
0000000000609647	nopw	(%rax,%rax)
__ZN27MaskBaseSubSegmentationInfoC2E35FFEffectMissingSynthesizedDataState11CMTimeRangeP8NSString:
0000000000609650	pushq	%rbp
0000000000609651	movq	%rsp, %rbp
0000000000609654	pushq	%r14
0000000000609656	pushq	%rbx
0000000000609657	movq	%rdi, %rbx
000000000060965a	movb	$0x1, (%rdi)
000000000060965d	movq	%rsi, 0x8(%rdi)
0000000000609661	movaps	0x10(%rbp), %xmm0
0000000000609665	movaps	0x20(%rbp), %xmm1
0000000000609669	movaps	0x30(%rbp), %xmm2
000000000060966d	movups	%xmm0, 0x10(%rdi)
0000000000609671	movups	%xmm1, 0x20(%rdi)
0000000000609675	movups	%xmm2, 0x30(%rdi)
0000000000609679	movq	%rdx, 0x40(%rdi)
000000000060967d	addq	$0x40, %rbx
0000000000609681	movq	%rbx, %rdi
0000000000609684	callq	0x1496f90                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl6retainEv
0000000000609689	popq	%rbx
000000000060968a	popq	%r14
000000000060968c	popq	%rbp
000000000060968d	retq
000000000060968e	movq	%rax, %r14
0000000000609691	movq	%rbx, %rdi
0000000000609694	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609699	movq	%r14, %rdi
000000000060969c	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000006096a1	movq	%rax, %rdi
00000000006096a4	callq	___clang_call_terminate
00000000006096a9	nopl	(%rax)
__ZN27MaskBaseSubSegmentationInfoC1E35FFEffectMissingSynthesizedDataState11CMTimeRangeP8NSString:
00000000006096b0	pushq	%rbp
00000000006096b1	movq	%rsp, %rbp
00000000006096b4	pushq	%r14
00000000006096b6	pushq	%rbx
00000000006096b7	movq	%rdi, %rbx
00000000006096ba	movb	$0x1, (%rdi)
00000000006096bd	movq	%rsi, 0x8(%rdi)
00000000006096c1	movaps	0x10(%rbp), %xmm0
00000000006096c5	movaps	0x20(%rbp), %xmm1
00000000006096c9	movaps	0x30(%rbp), %xmm2
00000000006096cd	movups	%xmm0, 0x10(%rdi)
00000000006096d1	movups	%xmm1, 0x20(%rdi)
00000000006096d5	movups	%xmm2, 0x30(%rdi)
00000000006096d9	movq	%rdx, 0x40(%rdi)
00000000006096dd	addq	$0x40, %rbx
00000000006096e1	movq	%rbx, %rdi
00000000006096e4	callq	0x1496f90                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl6retainEv
00000000006096e9	popq	%rbx
00000000006096ea	popq	%r14
00000000006096ec	popq	%rbp
00000000006096ed	retq
00000000006096ee	movq	%rax, %r14
00000000006096f1	movq	%rbx, %rdi
00000000006096f4	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
00000000006096f9	movq	%r14, %rdi
00000000006096fc	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000609701	movq	%rax, %rdi
0000000000609704	callq	___clang_call_terminate
0000000000609709	nopl	(%rax)
__ZN27MaskBaseSubSegmentationInfoC2ERKS_:
0000000000609710	pushq	%rbp
0000000000609711	movq	%rsp, %rbp
0000000000609714	pushq	%r14
0000000000609716	pushq	%rbx
0000000000609717	leaq	0x40(%rdi), %rbx
000000000060971b	movq	$0x0, 0x40(%rdi)
0000000000609723	movzbl	(%rsi), %eax
0000000000609726	movb	%al, (%rdi)
0000000000609728	movq	0x8(%rsi), %rax
000000000060972c	movq	%rax, 0x8(%rdi)
0000000000609730	movups	0x10(%rsi), %xmm0
0000000000609734	movups	0x20(%rsi), %xmm1
0000000000609738	movups	0x30(%rsi), %xmm2
000000000060973c	movups	%xmm0, 0x10(%rdi)
0000000000609740	movups	%xmm1, 0x20(%rdi)
0000000000609744	movups	%xmm2, 0x30(%rdi)
0000000000609748	addq	$0x40, %rsi
000000000060974c	movq	%rbx, %rdi
000000000060974f	callq	0x1496120                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSERKS0_
0000000000609754	popq	%rbx
0000000000609755	popq	%r14
0000000000609757	popq	%rbp
0000000000609758	retq
0000000000609759	movq	%rax, %r14
000000000060975c	movq	%rbx, %rdi
000000000060975f	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609764	movq	%r14, %rdi
0000000000609767	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000060976c	movq	%rax, %rdi
000000000060976f	callq	___clang_call_terminate
0000000000609774	nopw	%cs:(%rax,%rax)
__ZN27MaskBaseSubSegmentationInfoC1ERKS_:
0000000000609780	pushq	%rbp
0000000000609781	movq	%rsp, %rbp
0000000000609784	pushq	%r14
0000000000609786	pushq	%rbx
0000000000609787	leaq	0x40(%rdi), %rbx
000000000060978b	movq	$0x0, 0x40(%rdi)
0000000000609793	movzbl	(%rsi), %eax
0000000000609796	movb	%al, (%rdi)
0000000000609798	movq	0x8(%rsi), %rax
000000000060979c	movq	%rax, 0x8(%rdi)
00000000006097a0	movups	0x10(%rsi), %xmm0
00000000006097a4	movups	0x20(%rsi), %xmm1
00000000006097a8	movups	0x30(%rsi), %xmm2
00000000006097ac	movups	%xmm0, 0x10(%rdi)
00000000006097b0	movups	%xmm1, 0x20(%rdi)
00000000006097b4	movups	%xmm2, 0x30(%rdi)
00000000006097b8	addq	$0x40, %rsi
00000000006097bc	movq	%rbx, %rdi
00000000006097bf	callq	0x1496120                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSERKS0_
00000000006097c4	popq	%rbx
00000000006097c5	popq	%r14
00000000006097c7	popq	%rbp
00000000006097c8	retq
00000000006097c9	movq	%rax, %r14
00000000006097cc	movq	%rbx, %rdi
00000000006097cf	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
00000000006097d4	movq	%r14, %rdi
00000000006097d7	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000006097dc	movq	%rax, %rdi
00000000006097df	callq	___clang_call_terminate
00000000006097e4	nopw	%cs:(%rax,%rax)
__ZN27MaskBaseSubSegmentationInfo9mergeWithERKS_:
00000000006097f0	pushq	%rbp
00000000006097f1	movq	%rsp, %rbp
00000000006097f4	pushq	%r15
00000000006097f6	pushq	%r14
00000000006097f8	pushq	%r13
00000000006097fa	pushq	%r12
00000000006097fc	pushq	%rbx
00000000006097fd	subq	$0x108, %rsp                    ## imm = 0x108
0000000000609804	movq	%rsi, %rbx
0000000000609807	movq	%rdi, %r14
000000000060980a	movzbl	(%rsi), %eax
000000000060980d	orb	%al, (%rdi)
000000000060980f	movq	0x8(%rdi), %rdi
0000000000609813	movq	0x8(%rsi), %rsi
0000000000609817	callq	_FFMergeMissingSynthesizedDataStates
000000000060981c	movq	%rax, 0x8(%r14)
0000000000609820	leaq	0x10(%r14), %r15
0000000000609824	movups	0x10(%r14), %xmm0
0000000000609829	movups	0x20(%r14), %xmm1
000000000060982e	movups	0x30(%r14), %xmm2
0000000000609833	movaps	%xmm2, -0xc0(%rbp)
000000000060983a	movaps	%xmm1, -0xd0(%rbp)
0000000000609841	movaps	%xmm0, -0xe0(%rbp)
0000000000609848	movups	0x10(%rbx), %xmm0
000000000060984c	movups	0x20(%rbx), %xmm1
0000000000609850	movups	0x30(%rbx), %xmm2
0000000000609854	movaps	%xmm2, -0x90(%rbp)
000000000060985b	movaps	%xmm1, -0xa0(%rbp)
0000000000609862	movaps	%xmm0, -0xb0(%rbp)
0000000000609869	movups	0x10(%r14), %xmm0
000000000060986e	movups	0x20(%r14), %xmm1
0000000000609873	movups	0x30(%r14), %xmm2
0000000000609878	movaps	%xmm2, -0x40(%rbp)
000000000060987c	movaps	%xmm1, -0x50(%rbp)
0000000000609880	movaps	%xmm0, -0x60(%rbp)
0000000000609884	movq	0x12dfa8d(%rip), %r12           ## literal pool symbol address: _kCMTimeZero
000000000060988b	movq	0x10(%r12), %rax
0000000000609890	movq	%rax, -0x70(%rbp)
0000000000609894	movups	(%r12), %xmm0
0000000000609899	movaps	%xmm0, -0x80(%rbp)
000000000060989d	movq	-0x70(%rbp), %rax
00000000006098a1	movq	%rax, 0x28(%rsp)
00000000006098a6	movaps	-0x80(%rbp), %xmm0
00000000006098aa	movups	%xmm0, 0x18(%rsp)
00000000006098af	movq	-0x38(%rbp), %rax
00000000006098b3	movq	%rax, 0x10(%rsp)
00000000006098b8	movups	-0x48(%rbp), %xmm0
00000000006098bc	movups	%xmm0, (%rsp)
00000000006098c0	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
00000000006098c5	testl	%eax, %eax
00000000006098c7	je	0x6099ec
00000000006098cd	movaps	-0xb0(%rbp), %xmm0
00000000006098d4	movaps	-0xa0(%rbp), %xmm1
00000000006098db	movaps	-0x90(%rbp), %xmm2
00000000006098e2	movaps	%xmm2, -0x40(%rbp)
00000000006098e6	movaps	%xmm1, -0x50(%rbp)
00000000006098ea	movaps	%xmm0, -0x60(%rbp)
00000000006098ee	movq	0x10(%r12), %rax
00000000006098f3	movq	%rax, -0x70(%rbp)
00000000006098f7	movups	(%r12), %xmm0
00000000006098fc	movaps	%xmm0, -0x80(%rbp)
0000000000609900	movq	-0x70(%rbp), %rax
0000000000609904	movq	%rax, 0x28(%rsp)
0000000000609909	movaps	-0x80(%rbp), %xmm0
000000000060990d	movups	%xmm0, 0x18(%rsp)
0000000000609912	movq	-0x38(%rbp), %rax
0000000000609916	movq	%rax, 0x10(%rsp)
000000000060991b	movups	-0x48(%rbp), %xmm0
000000000060991f	movups	%xmm0, (%rsp)
0000000000609923	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
0000000000609928	testl	%eax, %eax
000000000060992a	je	0x6099ec
0000000000609930	movaps	-0xb0(%rbp), %xmm0
0000000000609937	movaps	-0xa0(%rbp), %xmm1
000000000060993e	movaps	-0x90(%rbp), %xmm2
0000000000609945	movups	%xmm2, 0x20(%rsp)
000000000060994a	movups	%xmm1, 0x10(%rsp)
000000000060994f	movups	%xmm0, (%rsp)
0000000000609953	leaq	-0x60(%rbp), %rdi
0000000000609957	callq	0x1495b80                       ## symbol stub for: _PC_CMTimeRangeEnd
000000000060995c	movq	-0xd0(%rbp), %rax
0000000000609963	movq	%rax, 0x28(%rsp)
0000000000609968	movaps	-0xe0(%rbp), %xmm0
000000000060996f	movups	%xmm0, 0x18(%rsp)
0000000000609974	movq	-0x50(%rbp), %rax
0000000000609978	movq	%rax, 0x10(%rsp)
000000000060997d	movups	-0x60(%rbp), %xmm0
0000000000609981	movups	%xmm0, (%rsp)
0000000000609985	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
000000000060998a	testl	%eax, %eax
000000000060998c	jle	0x6099ec
000000000060998e	movaps	-0xe0(%rbp), %xmm0
0000000000609995	movaps	-0xd0(%rbp), %xmm1
000000000060999c	movaps	-0xc0(%rbp), %xmm2
00000000006099a3	movups	%xmm2, 0x20(%rsp)
00000000006099a8	movups	%xmm1, 0x10(%rsp)
00000000006099ad	movups	%xmm0, (%rsp)
00000000006099b1	leaq	-0x60(%rbp), %rdi
00000000006099b5	callq	0x1495b80                       ## symbol stub for: _PC_CMTimeRangeEnd
00000000006099ba	movq	-0x50(%rbp), %rax
00000000006099be	movq	%rax, 0x28(%rsp)
00000000006099c3	movups	-0x60(%rbp), %xmm0
00000000006099c7	movups	%xmm0, 0x18(%rsp)
00000000006099cc	movq	-0xa0(%rbp), %rax
00000000006099d3	movq	%rax, 0x10(%rsp)
00000000006099d8	movaps	-0xb0(%rbp), %xmm0
00000000006099df	movups	%xmm0, (%rsp)
00000000006099e3	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
00000000006099e8	testl	%eax, %eax
00000000006099ea	js	0x609a50
00000000006099ec	movq	0x12df91d(%rip), %rax           ## literal pool symbol address: _kCMTimeRangeZero
00000000006099f3	movups	(%rax), %xmm0
00000000006099f6	movups	0x10(%rax), %xmm1
00000000006099fa	movups	0x20(%rax), %xmm2
00000000006099fe	movaps	%xmm2, -0x40(%rbp)
0000000000609a02	movaps	%xmm1, -0x50(%rbp)
0000000000609a06	movaps	%xmm0, -0x60(%rbp)
0000000000609a0a	movaps	-0x60(%rbp), %xmm0
0000000000609a0e	movaps	-0x50(%rbp), %xmm1
0000000000609a12	movaps	-0x40(%rbp), %xmm2
0000000000609a16	movups	%xmm2, 0x20(%r15)
0000000000609a1b	movups	%xmm1, 0x10(%r15)
0000000000609a20	movups	%xmm0, (%r15)
0000000000609a24	cmpq	$0x0, 0x40(%rbx)
0000000000609a29	je	0x609a3e
0000000000609a2b	addq	$0x40, %rbx
0000000000609a2f	addq	$0x40, %r14
0000000000609a33	movq	%r14, %rdi
0000000000609a36	movq	%rbx, %rsi
0000000000609a39	callq	0x1496120                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSERKS0_
0000000000609a3e	addq	$0x108, %rsp                    ## imm = 0x108
0000000000609a45	popq	%rbx
0000000000609a46	popq	%r12
0000000000609a48	popq	%r13
0000000000609a4a	popq	%r14
0000000000609a4c	popq	%r15
0000000000609a4e	popq	%rbp
0000000000609a4f	retq
0000000000609a50	movaps	-0xe0(%rbp), %xmm0
0000000000609a57	movaps	-0xd0(%rbp), %xmm1
0000000000609a5e	movaps	-0xc0(%rbp), %xmm2
0000000000609a65	movups	%xmm2, 0x20(%rsp)
0000000000609a6a	movups	%xmm1, 0x10(%rsp)
0000000000609a6f	movups	%xmm0, (%rsp)
0000000000609a73	leaq	-0x80(%rbp), %rdi
0000000000609a77	callq	0x1495b80                       ## symbol stub for: _PC_CMTimeRangeEnd
0000000000609a7c	movaps	-0xb0(%rbp), %xmm0
0000000000609a83	movaps	-0xa0(%rbp), %xmm1
0000000000609a8a	movaps	-0x90(%rbp), %xmm2
0000000000609a91	movups	%xmm2, 0x20(%rsp)
0000000000609a96	movups	%xmm1, 0x10(%rsp)
0000000000609a9b	movups	%xmm0, (%rsp)
0000000000609a9f	leaq	-0xf8(%rbp), %r12
0000000000609aa6	movq	%r12, %rdi
0000000000609aa9	callq	0x1495b80                       ## symbol stub for: _PC_CMTimeRangeEnd
0000000000609aae	movq	-0xa0(%rbp), %rax
0000000000609ab5	movq	%rax, 0x28(%rsp)
0000000000609aba	movaps	-0xb0(%rbp), %xmm0
0000000000609ac1	movups	%xmm0, 0x18(%rsp)
0000000000609ac6	movq	-0xd0(%rbp), %rax
0000000000609acd	movq	%rax, 0x10(%rsp)
0000000000609ad2	movaps	-0xe0(%rbp), %xmm0
0000000000609ad9	movups	%xmm0, (%rsp)
0000000000609add	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
0000000000609ae2	movl	%eax, %r13d
0000000000609ae5	movq	-0xe8(%rbp), %rax
0000000000609aec	movq	%rax, 0x28(%rsp)
0000000000609af1	movups	-0xf8(%rbp), %xmm0
0000000000609af8	movups	%xmm0, 0x18(%rsp)
0000000000609afd	movq	-0x70(%rbp), %rax
0000000000609b01	movq	%rax, 0x10(%rsp)
0000000000609b06	movups	-0x80(%rbp), %xmm0
0000000000609b0a	movups	%xmm0, (%rsp)
0000000000609b0e	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
0000000000609b13	testl	%r13d, %r13d
0000000000609b16	setle	%cl
0000000000609b19	testl	%eax, %eax
0000000000609b1b	setns	%dl
0000000000609b1e	andb	%cl, %dl
0000000000609b20	cmpb	$0x1, %dl
0000000000609b23	jne	0x609b3f
0000000000609b25	movaps	-0xb0(%rbp), %xmm0
0000000000609b2c	movaps	-0xa0(%rbp), %xmm1
0000000000609b33	movaps	-0x90(%rbp), %xmm2
0000000000609b3a	jmp	0x6099fe
0000000000609b3f	testl	%r13d, %r13d
0000000000609b42	setns	%cl
0000000000609b45	testl	%eax, %eax
0000000000609b47	setle	%dl
0000000000609b4a	andb	%cl, %dl
0000000000609b4c	cmpb	$0x1, %dl
0000000000609b4f	jne	0x609b6b
0000000000609b51	movaps	-0xe0(%rbp), %xmm0
0000000000609b58	movaps	-0xd0(%rbp), %xmm1
0000000000609b5f	movaps	-0xc0(%rbp), %xmm2
0000000000609b66	jmp	0x6099fe
0000000000609b6b	testl	%eax, %eax
0000000000609b6d	leaq	-0x80(%rbp), %rax
0000000000609b71	cmovsq	%rax, %r12
0000000000609b75	testl	%r13d, %r13d
0000000000609b78	leaq	-0xe0(%rbp), %rax
0000000000609b7f	leaq	-0xb0(%rbp), %rcx
0000000000609b86	cmovgq	%rax, %rcx
0000000000609b8a	movq	0x10(%r12), %rax
0000000000609b8f	movq	%rax, 0x28(%rsp)
0000000000609b94	movups	(%r12), %xmm0
0000000000609b99	movups	%xmm0, 0x18(%rsp)
0000000000609b9e	movq	0x10(%rcx), %rax
0000000000609ba2	movq	%rax, 0x10(%rsp)
0000000000609ba7	movups	(%rcx), %xmm0
0000000000609baa	movups	%xmm0, (%rsp)
0000000000609bae	leaq	-0x60(%rbp), %rdi
0000000000609bb2	callq	0x1495b8c                       ## symbol stub for: _PC_CMTimeRangeMakeWithStartEnd
0000000000609bb7	jmp	0x609a0a
0000000000609bbc	nopl	(%rax)
-[FFMaskedEffectBase _missingSynthesizedData:atTime:context:channelOffset:]:
0000000000609bc0	pushq	%rbp
0000000000609bc1	movq	%rsp, %rbp
0000000000609bc4	pushq	%r15
0000000000609bc6	pushq	%r14
0000000000609bc8	pushq	%r13
0000000000609bca	pushq	%r12
0000000000609bcc	pushq	%rbx
0000000000609bcd	subq	$0x188, %rsp                    ## imm = 0x188
0000000000609bd4	movq	%r8, %r12
0000000000609bd7	movq	%rsi, %r15
0000000000609bda	movq	%rdi, %r14
0000000000609bdd	movq	$0x0, -0x70(%rbp)
0000000000609be5	leaq	-0x70(%rbp), %rax
0000000000609be9	movq	%rax, -0x68(%rbp)
0000000000609bed	movabsq	$0x4812000000, %rax             ## imm = 0x4812000000
0000000000609bf7	movq	%rax, -0x60(%rbp)
0000000000609bfb	leaq	___Block_byref_object_copy_(%rip), %rax
0000000000609c02	movq	%rax, -0x58(%rbp)
0000000000609c06	leaq	___Block_byref_object_dispose_(%rip), %rax
0000000000609c0d	movq	%rax, -0x50(%rbp)
0000000000609c11	movq	$0x0, -0x48(%rbp)
0000000000609c19	leaq	-0x40(%rbp), %rax
0000000000609c1d	movq	%rax, -0x40(%rbp)
0000000000609c21	movq	%rax, -0x38(%rbp)
0000000000609c25	movq	$0x0, -0x30(%rbp)
0000000000609c2d	movq	0x15ca9cc(%rip), %rsi
0000000000609c34	movq	%r15, %rdi
0000000000609c37	callq	*0x12e3a83(%rip)                ## Objc message: -[%rdi notApplicableSelectionMarker]
0000000000609c3d	movq	%rax, %r13
0000000000609c40	leaq	0x10(%rbp), %rbx
0000000000609c44	movq	0x12df6b5(%rip), %rax           ## literal pool symbol address: _kCMTimePositiveInfinity
0000000000609c4b	movq	0x10(%rax), %rcx
0000000000609c4f	movq	%rcx, -0xb0(%rbp)
0000000000609c56	movups	(%rax), %xmm0
0000000000609c59	movaps	%xmm0, -0xc0(%rbp)
0000000000609c60	movq	-0xb0(%rbp), %rax
0000000000609c67	movq	%rax, 0x28(%rsp)
0000000000609c6c	movaps	-0xc0(%rbp), %xmm0
0000000000609c73	movups	%xmm0, 0x18(%rsp)
0000000000609c78	movq	0x10(%rbx), %rax
0000000000609c7c	movq	%rax, 0x10(%rsp)
0000000000609c81	movups	(%rbx), %xmm0
0000000000609c84	movups	%xmm0, (%rsp)
0000000000609c88	leaq	-0x178(%rbp), %rdi
0000000000609c8f	callq	0x1495b8c                       ## symbol stub for: _PC_CMTimeRangeMakeWithStartEnd
0000000000609c94	movq	0x12e3e9d(%rip), %rax           ## literal pool symbol address: __NSConcreteStackBlock
0000000000609c9b	movq	%rax, -0x148(%rbp)
0000000000609ca2	movl	$0xc2000000, %eax               ## imm = 0xC2000000
0000000000609ca7	movq	%rax, -0x140(%rbp)
0000000000609cae	leaq	"___75-[FFMaskedEffectBase _missingSynthesizedData:atTime:context:channelOffset:]_block_invoke"(%rip), %rax
0000000000609cb5	movq	%rax, -0x138(%rbp)
0000000000609cbc	leaq	"___block_descriptor_136_e8_32o40o48r_e23_v24?0\"FFMaskBase\"8*16l"(%rip), %rax
0000000000609cc3	movq	%rax, -0x130(%rbp)
0000000000609cca	movq	%r15, -0x128(%rbp)
0000000000609cd1	movq	%r13, -0x110(%rbp)
0000000000609cd8	movups	-0x178(%rbp), %xmm0
0000000000609cdf	movups	-0x168(%rbp), %xmm1
0000000000609ce6	movups	-0x158(%rbp), %xmm2
0000000000609ced	movups	%xmm0, -0x108(%rbp)
0000000000609cf4	movups	%xmm1, -0xf8(%rbp)
0000000000609cfb	movups	%xmm2, -0xe8(%rbp)
0000000000609d02	movups	(%rbx), %xmm0
0000000000609d05	movups	%xmm0, -0xd8(%rbp)
0000000000609d0c	movq	0x10(%rbx), %rax
0000000000609d10	movq	%rax, -0xc8(%rbp)
0000000000609d17	movq	%r12, -0x120(%rbp)
0000000000609d1e	leaq	-0x70(%rbp), %rax
0000000000609d22	movq	%rax, -0x118(%rbp)
0000000000609d29	movq	0x15ca958(%rip), %rsi
0000000000609d30	leaq	-0x148(%rbp), %rdx
0000000000609d37	movq	%r15, %rdi
0000000000609d3a	callq	*0x12e3980(%rip)                ## Objc message: -[%rdi notApplicableSelectionMarker]
0000000000609d40	movb	$0x0, (%r14)
0000000000609d44	movq	$0x0, 0x8(%r14)
0000000000609d4c	movq	0x12e17a5(%rip), %rax           ## literal pool symbol address: _kPC_CMTimeRangeInfinite
0000000000609d53	movups	(%rax), %xmm0
0000000000609d56	movups	0x10(%rax), %xmm1
0000000000609d5a	movups	0x20(%rax), %xmm2
0000000000609d5e	movups	%xmm0, 0x10(%r14)
0000000000609d63	movups	%xmm1, 0x20(%r14)
0000000000609d68	movups	%xmm2, 0x30(%r14)
0000000000609d6d	movq	$0x0, 0x40(%r14)
0000000000609d75	movq	-0x68(%rbp), %r15
0000000000609d79	movq	0x38(%r15), %rbx
0000000000609d7d	addq	$0x30, %r15
0000000000609d81	cmpq	%r15, %rbx
0000000000609d84	je	0x609e03
0000000000609d86	leaq	0x40(%r14), %rax
0000000000609d8a	movq	%rax, -0x78(%rbp)
0000000000609d8e	leaq	-0x80(%rbp), %r12
0000000000609d92	leaq	-0xc0(%rbp), %r13
0000000000609d99	nopl	(%rax)
0000000000609da0	movq	$0x0, -0x80(%rbp)
0000000000609da8	movzbl	0x10(%rbx), %eax
0000000000609dac	movb	%al, -0xc0(%rbp)
0000000000609db2	movq	0x18(%rbx), %rax
0000000000609db6	movq	%rax, -0xb8(%rbp)
0000000000609dbd	movups	0x20(%rbx), %xmm0
0000000000609dc1	movups	0x30(%rbx), %xmm1
0000000000609dc5	movups	0x40(%rbx), %xmm2
0000000000609dc9	movups	%xmm2, -0x10(%r12)
0000000000609dcf	movups	%xmm1, -0x20(%r12)
0000000000609dd5	movups	%xmm0, -0x30(%r12)
0000000000609ddb	leaq	0x50(%rbx), %rsi
0000000000609ddf	movq	%r12, %rdi
0000000000609de2	callq	0x1496120                       ## symbol stub for: __ZN12ProCore_Impl11PCNSRefImplaSERKS0_
0000000000609de7	movq	%r14, %rdi
0000000000609dea	movq	%r13, %rsi
0000000000609ded	callq	__ZN27MaskBaseSubSegmentationInfo9mergeWithERKS_ ## MaskBaseSubSegmentationInfo::mergeWith(MaskBaseSubSegmentationInfo const&)
0000000000609df2	movq	%r12, %rdi
0000000000609df5	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609dfa	movq	0x8(%rbx), %rbx
0000000000609dfe	cmpq	%r15, %rbx
0000000000609e01	jne	0x609da0
0000000000609e03	leaq	-0x70(%rbp), %rdi
0000000000609e07	movl	$0x8, %esi
0000000000609e0c	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000609e11	cmpq	$0x0, -0x30(%rbp)
0000000000609e16	leaq	-0x40(%rbp), %r12
0000000000609e1a	je	0x609e5d
0000000000609e1c	movq	-0x40(%rbp), %rax
0000000000609e20	movq	-0x38(%rbp), %r15
0000000000609e24	movq	0x8(%rax), %rax
0000000000609e28	movq	(%r15), %rcx
0000000000609e2b	movq	%rax, 0x8(%rcx)
0000000000609e2f	movq	%rcx, (%rax)
0000000000609e32	movq	$0x0, -0x30(%rbp)
0000000000609e3a	cmpq	%r12, %r15
0000000000609e3d	je	0x609e5d
0000000000609e3f	nop
0000000000609e40	movq	0x8(%r15), %rbx
0000000000609e44	leaq	0x50(%r15), %rdi
0000000000609e48	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609e4d	movq	%r15, %rdi
0000000000609e50	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000609e55	movq	%rbx, %r15
0000000000609e58	cmpq	%r12, %rbx
0000000000609e5b	jne	0x609e40
0000000000609e5d	movq	%r14, %rax
0000000000609e60	addq	$0x188, %rsp                    ## imm = 0x188
0000000000609e67	popq	%rbx
0000000000609e68	popq	%r12
0000000000609e6a	popq	%r13
0000000000609e6c	popq	%r14
0000000000609e6e	popq	%r15
0000000000609e70	popq	%rbp
0000000000609e71	retq
0000000000609e72	jmp	0x609e74
0000000000609e74	movq	%rax, %r14
0000000000609e77	jmp	0x609eaa
0000000000609e79	movq	%rax, %rdi
0000000000609e7c	callq	___clang_call_terminate
0000000000609e81	movq	%rax, %r14
0000000000609e84	movq	%r12, %rdi
0000000000609e87	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609e8c	jmp	0x609ea1
0000000000609e8e	movq	%rax, %rdi
0000000000609e91	callq	___clang_call_terminate
0000000000609e96	movq	%rax, %r14
0000000000609e99	movq	%r12, %rdi
0000000000609e9c	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609ea1	movq	-0x78(%rbp), %rdi
0000000000609ea5	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609eaa	leaq	-0x70(%rbp), %rdi
0000000000609eae	movl	$0x8, %esi
0000000000609eb3	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000609eb8	leaq	-0x40(%rbp), %rdi
0000000000609ebc	callq	__ZNSt3__14listI27MaskBaseSubSegmentationInfoNS_9allocatorIS1_EEED1Ev ## std::__1::list<MaskBaseSubSegmentationInfo, std::__1::allocator<MaskBaseSubSegmentationInfo>>::~list()
0000000000609ec1	movq	%r14, %rdi
0000000000609ec4	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000609ec9	movq	%rax, %rdi
0000000000609ecc	callq	___clang_call_terminate
0000000000609ed1	movq	%rax, %rdi
0000000000609ed4	callq	___clang_call_terminate
0000000000609ed9	movq	%rax, %rdi
0000000000609edc	callq	___clang_call_terminate
0000000000609ee1	nopw	%cs:(%rax,%rax)
___Block_byref_object_copy_:
0000000000609ef0	leaq	0x30(%rdi), %rax
0000000000609ef4	movq	%rax, 0x30(%rdi)
0000000000609ef8	movq	%rax, 0x38(%rdi)
0000000000609efc	movq	$0x0, 0x40(%rdi)
0000000000609f04	movq	0x40(%rsi), %rcx
0000000000609f08	testq	%rcx, %rcx
0000000000609f0b	je	0x609f47
0000000000609f0d	pushq	%rbp
0000000000609f0e	movq	%rsp, %rbp
0000000000609f11	movq	0x30(%rsi), %rdx
0000000000609f15	movq	0x38(%rsi), %r8
0000000000609f19	movq	0x8(%rdx), %r9
0000000000609f1d	movq	(%r8), %r10
0000000000609f20	movq	%r9, 0x8(%r10)
0000000000609f24	movq	%r10, (%r9)
0000000000609f27	movq	0x30(%rdi), %r9
0000000000609f2b	movq	%r8, 0x8(%r9)
0000000000609f2f	movq	%r9, (%r8)
0000000000609f32	movq	%rdx, 0x30(%rdi)
0000000000609f36	movq	%rax, 0x8(%rdx)
0000000000609f3a	movq	%rcx, 0x40(%rdi)
0000000000609f3e	movq	$0x0, 0x40(%rsi)
0000000000609f46	popq	%rbp
0000000000609f47	retq
0000000000609f48	nopl	(%rax,%rax)
___Block_byref_object_dispose_:
0000000000609f50	pushq	%rbp
0000000000609f51	movq	%rsp, %rbp
0000000000609f54	pushq	%r15
0000000000609f56	pushq	%r14
0000000000609f58	pushq	%rbx
0000000000609f59	pushq	%rax
0000000000609f5a	cmpq	$0x0, 0x40(%rdi)
0000000000609f5f	je	0x609fad
0000000000609f61	leaq	0x30(%rdi), %r14
0000000000609f65	movq	0x30(%rdi), %rax
0000000000609f69	movq	0x38(%rdi), %rbx
0000000000609f6d	movq	0x8(%rax), %rax
0000000000609f71	movq	(%rbx), %rcx
0000000000609f74	movq	%rax, 0x8(%rcx)
0000000000609f78	movq	%rcx, (%rax)
0000000000609f7b	movq	$0x0, 0x40(%rdi)
0000000000609f83	cmpq	%r14, %rbx
0000000000609f86	je	0x609fad
0000000000609f88	nopl	(%rax,%rax)
0000000000609f90	movq	0x8(%rbx), %r15
0000000000609f94	leaq	0x50(%rbx), %rdi
0000000000609f98	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000609f9d	movq	%rbx, %rdi
0000000000609fa0	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000609fa5	movq	%r15, %rbx
0000000000609fa8	cmpq	%r14, %r15
0000000000609fab	jne	0x609f90
0000000000609fad	addq	$0x8, %rsp
0000000000609fb1	popq	%rbx
0000000000609fb2	popq	%r14
0000000000609fb4	popq	%r15
0000000000609fb6	popq	%rbp
0000000000609fb7	retq
0000000000609fb8	movq	%rax, %rdi
0000000000609fbb	callq	___clang_call_terminate
