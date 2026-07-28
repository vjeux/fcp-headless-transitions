__ZN31HGInterlaceHandler_ExtractFieldC1Ev:
0000000000092e40	pushq	%rbp
0000000000092e41	movq	%rsp, %rbp
0000000000092e44	pushq	%r15
0000000000092e46	pushq	%r14
0000000000092e48	pushq	%rbx
0000000000092e49	pushq	%rax
0000000000092e4a	movq	%rdi, %rbx
0000000000092e4d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000092e52	leaq	0x977bff(%rip), %rax
0000000000092e59	movq	%rax, (%rbx)
0000000000092e5c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000092e61	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000092e66	movq	%rax, %r14
0000000000092e69	movl	$0x1a0, %esi                    ## imm = 0x1A0
0000000000092e6e	movq	%rax, %rdi
0000000000092e71	callq	0x3c4fca                        ## symbol stub for: ___bzero
0000000000092e76	movq	%r14, %rdi
0000000000092e79	callq	__ZN32HgcInterlaceHandler_ExtractFieldC2Ev ## HgcInterlaceHandler_ExtractField::HgcInterlaceHandler_ExtractField()
0000000000092e7e	leaq	0x978083(%rip), %rax
0000000000092e85	movq	%rax, (%r14)
0000000000092e88	movq	%r14, 0x198(%rbx)
0000000000092e8f	addq	$0x8, %rsp
0000000000092e93	popq	%rbx
0000000000092e94	popq	%r14
0000000000092e96	popq	%r15
0000000000092e98	popq	%rbp
0000000000092e99	retq
0000000000092e9a	movq	%rax, %r15
0000000000092e9d	movq	%r14, %rdi
0000000000092ea0	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000092ea5	movq	%rbx, %rdi
0000000000092ea8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000092ead	movq	%r15, %rdi
0000000000092eb0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000092eb5	movq	%rax, %r15
0000000000092eb8	movq	%rbx, %rdi
0000000000092ebb	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000092ec0	movq	%r15, %rdi
0000000000092ec3	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000092ec8	nopl	(%rax,%rax)
