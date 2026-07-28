__ZN15HGUnpremultiplyC2Ev:
0000000000157c70	pushq	%rbp
0000000000157c71	movq	%rsp, %rbp
0000000000157c74	pushq	%r15
0000000000157c76	pushq	%r14
0000000000157c78	pushq	%rbx
0000000000157c79	pushq	%rax
0000000000157c7a	movq	%rdi, %rbx
0000000000157c7d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000157c82	leaq	0x8c873f(%rip), %rax
0000000000157c89	movq	%rax, (%rbx)
0000000000157c8c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000157c91	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000157c96	movq	%rax, %r14
0000000000157c99	movq	%rax, %rdi
0000000000157c9c	callq	__ZN16HgcUnpremultiplyC1Ev      ## HgcUnpremultiply::HgcUnpremultiply()
0000000000157ca1	movq	%r14, 0x198(%rbx)
0000000000157ca8	addq	$0x8, %rsp
0000000000157cac	popq	%rbx
0000000000157cad	popq	%r14
0000000000157caf	popq	%r15
0000000000157cb1	popq	%rbp
0000000000157cb2	retq
0000000000157cb3	movq	%rax, %r15
0000000000157cb6	movq	%r14, %rdi
0000000000157cb9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157cbe	movq	%rbx, %rdi
0000000000157cc1	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157cc6	movq	%r15, %rdi
0000000000157cc9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157cce	movq	%rax, %r15
0000000000157cd1	movq	%rbx, %rdi
0000000000157cd4	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157cd9	movq	%r15, %rdi
0000000000157cdc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157ce1	nopw	%cs:(%rax,%rax)
__ZN15HGUnpremultiplyC1Ev:
0000000000157cf0	pushq	%rbp
0000000000157cf1	movq	%rsp, %rbp
0000000000157cf4	pushq	%r15
0000000000157cf6	pushq	%r14
0000000000157cf8	pushq	%rbx
0000000000157cf9	pushq	%rax
0000000000157cfa	movq	%rdi, %rbx
0000000000157cfd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000157d02	leaq	0x8c86bf(%rip), %rax
0000000000157d09	movq	%rax, (%rbx)
0000000000157d0c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000157d11	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000157d16	movq	%rax, %r14
0000000000157d19	movq	%rax, %rdi
0000000000157d1c	callq	__ZN16HgcUnpremultiplyC1Ev      ## HgcUnpremultiply::HgcUnpremultiply()
0000000000157d21	movq	%r14, 0x198(%rbx)
0000000000157d28	addq	$0x8, %rsp
0000000000157d2c	popq	%rbx
0000000000157d2d	popq	%r14
0000000000157d2f	popq	%r15
0000000000157d31	popq	%rbp
0000000000157d32	retq
0000000000157d33	movq	%rax, %r15
0000000000157d36	movq	%r14, %rdi
0000000000157d39	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157d3e	movq	%rbx, %rdi
0000000000157d41	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157d46	movq	%r15, %rdi
0000000000157d49	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157d4e	movq	%rax, %r15
0000000000157d51	movq	%rbx, %rdi
0000000000157d54	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157d59	movq	%r15, %rdi
0000000000157d5c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157d61	nopw	%cs:(%rax,%rax)
__ZN15HGUnpremultiplyD2Ev:
0000000000157d70	pushq	%rbp
0000000000157d71	movq	%rsp, %rbp
0000000000157d74	pushq	%rbx
0000000000157d75	pushq	%rax
0000000000157d76	movq	%rdi, %rbx
0000000000157d79	leaq	0x8c8648(%rip), %rax
0000000000157d80	movq	%rax, (%rdi)
0000000000157d83	movq	0x198(%rdi), %rdi
0000000000157d8a	movq	(%rdi), %rax
0000000000157d8d	callq	*0x18(%rax)
0000000000157d90	movq	%rbx, %rdi
0000000000157d93	addq	$0x8, %rsp
0000000000157d97	popq	%rbx
0000000000157d98	popq	%rbp
0000000000157d99	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157d9e	movq	%rax, %rdi
0000000000157da1	callq	___clang_call_terminate
0000000000157da6	nopw	%cs:(%rax,%rax)
__ZN15HGUnpremultiplyD1Ev:
0000000000157db0	pushq	%rbp
0000000000157db1	movq	%rsp, %rbp
0000000000157db4	pushq	%rbx
0000000000157db5	pushq	%rax
0000000000157db6	movq	%rdi, %rbx
0000000000157db9	leaq	0x8c8608(%rip), %rax
0000000000157dc0	movq	%rax, (%rdi)
0000000000157dc3	movq	0x198(%rdi), %rdi
0000000000157dca	movq	(%rdi), %rax
0000000000157dcd	callq	*0x18(%rax)
0000000000157dd0	movq	%rbx, %rdi
0000000000157dd3	addq	$0x8, %rsp
0000000000157dd7	popq	%rbx
0000000000157dd8	popq	%rbp
0000000000157dd9	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157dde	movq	%rax, %rdi
0000000000157de1	callq	___clang_call_terminate
0000000000157de6	nopw	%cs:(%rax,%rax)
__ZN15HGUnpremultiplyD0Ev:
0000000000157df0	pushq	%rbp
0000000000157df1	movq	%rsp, %rbp
0000000000157df4	pushq	%rbx
0000000000157df5	pushq	%rax
0000000000157df6	movq	%rdi, %rbx
0000000000157df9	leaq	0x8c85c8(%rip), %rax
0000000000157e00	movq	%rax, (%rdi)
0000000000157e03	movq	0x198(%rdi), %rdi
0000000000157e0a	movq	(%rdi), %rax
0000000000157e0d	callq	*0x18(%rax)
0000000000157e10	movq	%rbx, %rdi
0000000000157e13	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157e18	movq	%rbx, %rdi
0000000000157e1b	addq	$0x8, %rsp
0000000000157e1f	popq	%rbx
0000000000157e20	popq	%rbp
0000000000157e21	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157e26	movq	%rax, %rdi
0000000000157e29	callq	___clang_call_terminate
0000000000157e2e	nop
__ZN15HGUnpremultiply9GetOutputEP10HGRenderer:
0000000000157e30	pushq	%rbp
0000000000157e31	movq	%rsp, %rbp
0000000000157e34	pushq	%rbx
0000000000157e35	pushq	%rax
0000000000157e36	movq	%rdi, %rbx
0000000000157e39	movq	%rsi, %rdi
0000000000157e3c	movq	%rbx, %rsi
0000000000157e3f	xorl	%edx, %edx
0000000000157e41	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000157e46	movq	0x198(%rbx), %rdi
0000000000157e4d	movq	(%rdi), %rcx
0000000000157e50	xorl	%esi, %esi
0000000000157e52	movq	%rax, %rdx
0000000000157e55	callq	*0x78(%rcx)
