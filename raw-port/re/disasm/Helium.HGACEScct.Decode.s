__ZN9HGACEScct6DecodeC2Ev:
0000000000101b40	pushq	%rbp
0000000000101b41	movq	%rsp, %rbp
0000000000101b44	pushq	%r15
0000000000101b46	pushq	%r14
0000000000101b48	pushq	%rbx
0000000000101b49	pushq	%rax
0000000000101b4a	movq	%rdi, %rbx
0000000000101b4d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000101b52	leaq	0x916367(%rip), %rax
0000000000101b59	movq	%rax, (%rbx)
0000000000101b5c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000101b61	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000101b66	movq	%rax, %r14
0000000000101b69	movq	%rax, %rdi
0000000000101b6c	callq	__ZN18HgcLogVideo_decodeC1Ev    ## HgcLogVideo_decode::HgcLogVideo_decode()
0000000000101b71	movq	%r14, 0x198(%rbx)
0000000000101b78	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE1c(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::c
0000000000101b7f	testb	%al, %al
0000000000101b81	je	0x101bea
0000000000101b83	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE1d(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::d
0000000000101b8a	testb	%al, %al
0000000000101b8c	je	0x101bfa
0000000000101b8e	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE2bb(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::bb
0000000000101b95	testb	%al, %al
0000000000101b97	je	0x101c0a
0000000000101b99	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE2cc(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::cc
0000000000101ba0	testb	%al, %al
0000000000101ba2	je	0x101c1a
0000000000101ba4	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE2dd(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::dd
0000000000101bab	testb	%al, %al
0000000000101bad	je	0x101c2a
0000000000101baf	movss	__ZZN9HGACEScct6DecodeC1EvE2bb(%rip), %xmm0 ## HGACEScct::Decode::Decode()::bb
0000000000101bb7	movss	%xmm0, 0x1a0(%rbx)
0000000000101bbf	movss	__ZZN9HGACEScct6DecodeC1EvE2cc(%rip), %xmm0 ## HGACEScct::Decode::Decode()::cc
0000000000101bc7	movss	%xmm0, 0x1a4(%rbx)
0000000000101bcf	movss	__ZZN9HGACEScct6DecodeC1EvE2dd(%rip), %xmm0 ## HGACEScct::Decode::Decode()::dd
0000000000101bd7	movss	%xmm0, 0x1a8(%rbx)
0000000000101bdf	addq	$0x8, %rsp
0000000000101be3	popq	%rbx
0000000000101be4	popq	%r14
0000000000101be6	popq	%r15
0000000000101be8	popq	%rbp
0000000000101be9	retq
0000000000101bea	callq	__ZN9HGACEScct6DecodeC2Ev.cold.1 ## HGACEScct::Decode::Decode() (.cold.1)
0000000000101bef	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE1d(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::d
0000000000101bf6	testb	%al, %al
0000000000101bf8	jne	0x101b8e
0000000000101bfa	callq	__ZN9HGACEScct6DecodeC2Ev.cold.2 ## HGACEScct::Decode::Decode() (.cold.2)
0000000000101bff	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE2bb(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::bb
0000000000101c06	testb	%al, %al
0000000000101c08	jne	0x101b99
0000000000101c0a	callq	__ZN9HGACEScct6DecodeC2Ev.cold.3 ## HGACEScct::Decode::Decode() (.cold.3)
0000000000101c0f	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE2cc(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::cc
0000000000101c16	testb	%al, %al
0000000000101c18	jne	0x101ba4
0000000000101c1a	callq	__ZN9HGACEScct6DecodeC2Ev.cold.4 ## HGACEScct::Decode::Decode() (.cold.4)
0000000000101c1f	movzbl	__ZGVZN9HGACEScct6DecodeC1EvE2dd(%rip), %eax ## guard variable for HGACEScct::Decode::Decode()::dd
0000000000101c26	testb	%al, %al
0000000000101c28	jne	0x101baf
0000000000101c2a	callq	__ZN9HGACEScct6DecodeC2Ev.cold.5 ## HGACEScct::Decode::Decode() (.cold.5)
0000000000101c2f	jmp	0x101baf
0000000000101c34	movq	%rax, %r15
0000000000101c37	movq	%r14, %rdi
0000000000101c3a	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000101c3f	movq	%rbx, %rdi
0000000000101c42	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101c47	movq	%r15, %rdi
0000000000101c4a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000101c4f	movq	%rax, %r15
0000000000101c52	movq	%rbx, %rdi
0000000000101c55	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101c5a	movq	%r15, %rdi
0000000000101c5d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000101c62	nopw	%cs:(%rax,%rax)
__ZN9HGACEScct6DecodeC1Ev:
0000000000101c70	pushq	%rbp
0000000000101c71	movq	%rsp, %rbp
0000000000101c74	popq	%rbp
0000000000101c75	jmp	__ZN9HGACEScct6DecodeC2Ev       ## HGACEScct::Decode::Decode()
0000000000101c7a	nopw	(%rax,%rax)
__ZN9HGACEScct6DecodeD2Ev:
0000000000101c80	pushq	%rbp
0000000000101c81	movq	%rsp, %rbp
0000000000101c84	pushq	%rbx
0000000000101c85	pushq	%rax
0000000000101c86	leaq	0x916233(%rip), %rax
0000000000101c8d	movq	%rax, (%rdi)
0000000000101c90	movq	0x198(%rdi), %rax
0000000000101c97	testq	%rax, %rax
0000000000101c9a	je	0x101cab
0000000000101c9c	movq	(%rax), %rcx
0000000000101c9f	movq	%rdi, %rbx
0000000000101ca2	movq	%rax, %rdi
0000000000101ca5	callq	*0x18(%rcx)
0000000000101ca8	movq	%rbx, %rdi
0000000000101cab	addq	$0x8, %rsp
0000000000101caf	popq	%rbx
0000000000101cb0	popq	%rbp
0000000000101cb1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101cb6	movq	%rax, %rdi
0000000000101cb9	callq	___clang_call_terminate
0000000000101cbe	nop
__ZN9HGACEScct6DecodeD1Ev:
0000000000101cc0	pushq	%rbp
0000000000101cc1	movq	%rsp, %rbp
0000000000101cc4	pushq	%rbx
0000000000101cc5	pushq	%rax
0000000000101cc6	leaq	0x9161f3(%rip), %rax
0000000000101ccd	movq	%rax, (%rdi)
0000000000101cd0	movq	0x198(%rdi), %rax
0000000000101cd7	testq	%rax, %rax
0000000000101cda	je	0x101ceb
0000000000101cdc	movq	(%rax), %rcx
0000000000101cdf	movq	%rdi, %rbx
0000000000101ce2	movq	%rax, %rdi
0000000000101ce5	callq	*0x18(%rcx)
0000000000101ce8	movq	%rbx, %rdi
0000000000101ceb	addq	$0x8, %rsp
0000000000101cef	popq	%rbx
0000000000101cf0	popq	%rbp
0000000000101cf1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000101cf6	movq	%rax, %rdi
0000000000101cf9	callq	___clang_call_terminate
