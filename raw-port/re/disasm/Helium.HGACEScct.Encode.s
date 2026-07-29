===== __ZN9HGACEScct6EncodeC2Ev =====
__ZN9HGACEScct6EncodeC2Ev:
00000000001018c0	pushq	%rbp
00000000001018c1	movq	%rsp, %rbp
00000000001018c4	pushq	%r15
00000000001018c6	pushq	%r14
00000000001018c8	pushq	%rbx
00000000001018c9	pushq	%rax
00000000001018ca	movq	%rdi, %rbx
00000000001018cd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001018d2	leaq	0x9163a7(%rip), %rax
00000000001018d9	movq	%rax, (%rbx)
00000000001018dc	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001018e1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001018e6	movq	%rax, %r14
00000000001018e9	movq	%rax, %rdi
00000000001018ec	callq	__ZN18HgcLogVideo_encodeC1Ev    ## HgcLogVideo_encode::HgcLogVideo_encode()
00000000001018f1	movq	%r14, 0x198(%rbx)
00000000001018f8	movzbl	__ZGVZN9HGACEScct6EncodeC1EvE1c(%rip), %eax ## guard variable for HGACEScct::Encode::Encode()::c
00000000001018ff	testb	%al, %al
0000000000101901	je	0x101963
0000000000101903	movzbl	__ZGVZN9HGACEScct6EncodeC1EvE1d(%rip), %eax ## guard variable for HGACEScct::Encode::Encode()::d
000000000010190a	testb	%al, %al
000000000010190c	je	0x101973
000000000010190e	movzbl	__ZGVZN9HGACEScct6EncodeC1EvE2bb(%rip), %eax ## guard variable for HGACEScct::Encode::Encode()::bb
0000000000101915	testb	%al, %al
0000000000101917	je	0x101983
0000000000101919	movzbl	__ZGVZN9HGACEScct6EncodeC1EvE2cc(%rip), %eax ## guard variable for HGACEScct::Encode::Encode()::cc
0000000000101920	testb	%al, %al
0000000000101922	je	0x101993
0000000000101924	movsd	__ZZN9HGACEScct6EncodeC1EvE1d(%rip), %xmm0 ## HGACEScct::Encode::Encode()::d
000000000010192c	cvtsd2ss	%xmm0, %xmm0
0000000000101930	movss	%xmm0, 0x1a0(%rbx)
0000000000101938	movss	__ZZN9HGACEScct6EncodeC1EvE2bb(%rip), %xmm0 ## HGACEScct::Encode::Encode()::bb
0000000000101940	movss	%xmm0, 0x1a4(%rbx)
0000000000101948	movss	__ZZN9HGACEScct6EncodeC1EvE2cc(%rip), %xmm0 ## HGACEScct::Encode::Encode()::cc
0000000000101950	movss	%xmm0, 0x1a8(%rbx)
0000000000101958	addq	$0x8, %rsp
000000000010195c	popq	%rbx
000000000010195d	popq	%r14
000000000010195f	popq	%r15
0000000000101961	popq	%rbp
0000000000101962	retq
0000000000101963	callq	__ZN9HGACEScct6EncodeC2Ev.cold.1 ## HGACEScct::Encode::Encode() (.cold.1)
0000000000101968	movzbl	__ZGVZN9HGACEScct6EncodeC1EvE1d(%rip), %eax ## guard variable for HGACEScct::Encode::Encode()::d
000000000010196f	testb	%al, %al
0000000000101971	jne	0x10190e
0000000000101973	callq	__ZN9HGACEScct6EncodeC2Ev.cold.2 ## HGACEScct::Encode::Encode() (.cold.2)
0000000000101978	movzbl	__ZGVZN9HGACEScct6EncodeC1EvE2bb(%rip), %eax ## guard variable for HGACEScct::Encode::Encode()::bb
000000000010197f	testb	%al, %al
0000000000101981	jne	0x101919
0000000000101983	callq	__ZN9HGACEScct6EncodeC2Ev.cold.3 ## HGACEScct::Encode::Encode() (.cold.3)
0000000000101988	movzbl	__ZGVZN9HGACEScct6EncodeC1EvE2cc(%rip), %eax ## guard variable for HGACEScct::Encode::Encode()::cc
000000000010198f	testb	%al, %al
0000000000101991	jne	0x101924
0000000000101993	callq	__ZN9HGACEScct6EncodeC2Ev.cold.4 ## HGACEScct::Encode::Encode() (.cold.4)
0000000000101998	jmp	0x101924
000000000010199a	movq	%rax, %r15
000000000010199d	movq	%r14, %rdi
00000000001019a0	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001019a5	movq	%rbx, %rdi
00000000001019a8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001019ad	movq	%r15, %rdi
00000000001019b0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001019b5	movq	%rax, %r15
00000000001019b8	movq	%rbx, %rdi
00000000001019bb	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001019c0	movq	%r15, %rdi
00000000001019c3	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001019c8	nopl	(%rax,%rax)
===== __ZN9HGACEScct6EncodeC1Ev =====
__ZN9HGACEScct6EncodeC1Ev:
00000000001019d0	pushq	%rbp
00000000001019d1	movq	%rsp, %rbp
00000000001019d4	popq	%rbp
00000000001019d5	jmp	__ZN9HGACEScct6EncodeC2Ev       ## HGACEScct::Encode::Encode()
00000000001019da	nopw	(%rax,%rax)
===== __ZN9HGACEScct6EncodeD0Ev =====
__ZN9HGACEScct6EncodeD0Ev:
0000000000101a60	pushq	%rbp
0000000000101a61	movq	%rsp, %rbp
0000000000101a64	pushq	%rbx
0000000000101a65	pushq	%rax
0000000000101a66	movq	%rdi, %rbx
0000000000101a69	leaq	0x916210(%rip), %rax
0000000000101a70	movq	%rax, (%rdi)
0000000000101a73	movq	0x198(%rdi), %rdi
0000000000101a7a	testq	%rdi, %rdi
0000000000101a7d	je	0x101a85
0000000000101a7f	movq	(%rdi), %rax
0000000000101a82	callq	*0x18(%rax)
0000000000101a85	movq	%rbx, %rdi
0000000000101a88	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101a8d	movq	%rbx, %rdi
0000000000101a90	addq	$0x8, %rsp
0000000000101a94	popq	%rbx
0000000000101a95	popq	%rbp
0000000000101a96	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000101a9b	movq	%rax, %rdi
0000000000101a9e	callq	___clang_call_terminate
0000000000101aa3	nopw	%cs:(%rax,%rax)
===== __ZN9HGACEScct6EncodeD1Ev =====
__ZN9HGACEScct6EncodeD1Ev:
0000000000101a20	pushq	%rbp
0000000000101a21	movq	%rsp, %rbp
0000000000101a24	pushq	%rbx
0000000000101a25	pushq	%rax
0000000000101a26	leaq	0x916253(%rip), %rax
0000000000101a2d	movq	%rax, (%rdi)
0000000000101a30	movq	0x198(%rdi), %rax
0000000000101a37	testq	%rax, %rax
0000000000101a3a	je	0x101a4b
0000000000101a3c	movq	(%rax), %rcx
0000000000101a3f	movq	%rdi, %rbx
0000000000101a42	movq	%rax, %rdi
0000000000101a45	callq	*0x18(%rcx)
0000000000101a48	movq	%rbx, %rdi
0000000000101a4b	addq	$0x8, %rsp
0000000000101a4f	popq	%rbx
0000000000101a50	popq	%rbp
0000000000101a51	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101a56	movq	%rax, %rdi
0000000000101a59	callq	___clang_call_terminate
0000000000101a5e	nop
===== __ZN9HGACEScct6EncodeD2Ev =====
__ZN9HGACEScct6EncodeD2Ev:
00000000001019e0	pushq	%rbp
00000000001019e1	movq	%rsp, %rbp
00000000001019e4	pushq	%rbx
00000000001019e5	pushq	%rax
00000000001019e6	leaq	0x916293(%rip), %rax
00000000001019ed	movq	%rax, (%rdi)
00000000001019f0	movq	0x198(%rdi), %rax
00000000001019f7	testq	%rax, %rax
00000000001019fa	je	0x101a0b
00000000001019fc	movq	(%rax), %rcx
00000000001019ff	movq	%rdi, %rbx
0000000000101a02	movq	%rax, %rdi
0000000000101a05	callq	*0x18(%rcx)
0000000000101a08	movq	%rbx, %rdi
0000000000101a0b	addq	$0x8, %rsp
0000000000101a0f	popq	%rbx
0000000000101a10	popq	%rbp
0000000000101a11	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101a16	movq	%rax, %rdi
0000000000101a19	callq	___clang_call_terminate
0000000000101a1e	nop
===== __ZN9HGACEScct6Encode9GetOutputEP10HGRenderer =====
__ZN9HGACEScct6Encode9GetOutputEP10HGRenderer:
0000000000101ab0	pushq	%rbp
0000000000101ab1	movq	%rsp, %rbp
0000000000101ab4	pushq	%r14
0000000000101ab6	pushq	%rbx
0000000000101ab7	movq	%rdi, %rbx
0000000000101aba	movq	0x198(%rdi), %r14
0000000000101ac1	movq	%rsi, %rdi
0000000000101ac4	movq	%rbx, %rsi
0000000000101ac7	xorl	%edx, %edx
0000000000101ac9	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000101ace	movq	(%r14), %rcx
0000000000101ad1	movq	%r14, %rdi
0000000000101ad4	xorl	%esi, %esi
0000000000101ad6	movq	%rax, %rdx
0000000000101ad9	callq	*0x78(%rcx)
0000000000101adc	movq	0x198(%rbx), %rdi
0000000000101ae3	movss	0x1a4(%rbx), %xmm3
0000000000101aeb	movq	(%rdi), %rax
0000000000101aee	movss	0x2c61ca(%rip), %xmm0
0000000000101af6	movss	0x2cf4aa(%rip), %xmm2
0000000000101afe	xorps	%xmm1, %xmm1
0000000000101b01	xorl	%esi, %esi
0000000000101b03	callq	*0x60(%rax)
0000000000101b06	movq	0x198(%rbx), %rdi
0000000000101b0d	movss	0x1a8(%rbx), %xmm0
0000000000101b15	movss	0x1a0(%rbx), %xmm1
0000000000101b1d	movq	(%rdi), %rax
0000000000101b20	movss	0x2cf484(%rip), %xmm2
0000000000101b28	xorps	%xmm3, %xmm3
0000000000101b2b	movl	$0x1, %esi
0000000000101b30	callq	*0x60(%rax)
0000000000101b33	movq	0x198(%rbx), %rax
0000000000101b3a	popq	%rbx
0000000000101b3b	popq	%r14
0000000000101b3d	popq	%rbp
0000000000101b3e	retq
0000000000101b3f	nop
