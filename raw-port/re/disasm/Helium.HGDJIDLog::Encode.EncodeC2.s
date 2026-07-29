__ZN9HGDJIDLog6EncodeC2ENS_16SceneColorimetryE:
0000000000103c20	pushq	%rbp
0000000000103c21	movq	%rsp, %rbp
0000000000103c24	pushq	%r15
0000000000103c26	pushq	%r14
0000000000103c28	pushq	%rbx
0000000000103c29	pushq	%rax
0000000000103c2a	movl	%esi, %r14d
0000000000103c2d	movq	%rdi, %rbx
0000000000103c30	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000103c35	leaq	0x915904(%rip), %rax
0000000000103c3c	movq	%rax, (%rbx)
0000000000103c3f	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000103c44	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000103c49	movq	%rax, %r15
0000000000103c4c	movq	%rax, %rdi
0000000000103c4f	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000103c54	movq	%r15, 0x198(%rbx)
0000000000103c5b	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000103c60	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000103c65	movq	%rax, %r15
0000000000103c68	movq	%rax, %rdi
0000000000103c6b	callq	__ZN18HgcLogVideo_encodeC1Ev    ## HgcLogVideo_encode::HgcLogVideo_encode()
0000000000103c70	movq	%r15, 0x1a0(%rbx)
0000000000103c77	movl	%r14d, %eax
0000000000103c7a	shlq	$0x6, %rax
0000000000103c7e	leaq	__ZN9HGDJIDLog6Encode14sourceToDGamutE(%rip), %rcx ## HGDJIDLog::Encode::sourceToDGamut
0000000000103c85	addq	%rax, %rcx
0000000000103c88	movq	%rcx, 0x1a8(%rbx)
0000000000103c8f	addq	$0x8, %rsp
0000000000103c93	popq	%rbx
0000000000103c94	popq	%r14
0000000000103c96	popq	%r15
0000000000103c98	popq	%rbp
0000000000103c99	retq
0000000000103c9a	jmp	0x103c9c
0000000000103c9c	movq	%rax, %r14
0000000000103c9f	movq	%r15, %rdi
0000000000103ca2	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000103ca7	movq	%rbx, %rdi
0000000000103caa	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000103caf	movq	%r14, %rdi
0000000000103cb2	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000103cb7	movq	%rax, %r14
0000000000103cba	movq	%rbx, %rdi
0000000000103cbd	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000103cc2	movq	%r14, %rdi
0000000000103cc5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000103cca	nopw	(%rax,%rax)
