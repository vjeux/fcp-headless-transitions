__ZN18HGSony709_800_MLUTC2Ev:
0000000000104cc0	pushq	%rbp
0000000000104cc1	movq	%rsp, %rbp
0000000000104cc4	pushq	%r15
0000000000104cc6	pushq	%r14
0000000000104cc8	pushq	%rbx
0000000000104cc9	pushq	%rax
0000000000104cca	movq	%rdi, %rbx
0000000000104ccd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000104cd2	leaq	0x9155e7(%rip), %rax
0000000000104cd9	movq	%rax, (%rbx)
0000000000104cdc	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000104ce1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000104ce6	movq	%rax, %r14
0000000000104ce9	movq	%rax, %rdi
0000000000104cec	callq	__ZN19HgcSony709_800_MLUTC1Ev   ## HgcSony709_800_MLUT::HgcSony709_800_MLUT()
0000000000104cf1	movq	%r14, 0x198(%rbx)
0000000000104cf8	addq	$0x8, %rsp
0000000000104cfc	popq	%rbx
0000000000104cfd	popq	%r14
0000000000104cff	popq	%r15
0000000000104d01	popq	%rbp
0000000000104d02	retq
0000000000104d03	movq	%rax, %r15
0000000000104d06	movq	%r14, %rdi
0000000000104d09	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000104d0e	movq	%rbx, %rdi
0000000000104d11	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104d16	movq	%r15, %rdi
0000000000104d19	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000104d1e	movq	%rax, %r15
0000000000104d21	movq	%rbx, %rdi
0000000000104d24	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104d29	movq	%r15, %rdi
0000000000104d2c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000104d31	nopw	%cs:(%rax,%rax)
__ZN18HGSony709_800_MLUTC1Ev:
0000000000104d40	pushq	%rbp
0000000000104d41	movq	%rsp, %rbp
0000000000104d44	pushq	%r15
0000000000104d46	pushq	%r14
0000000000104d48	pushq	%rbx
0000000000104d49	pushq	%rax
0000000000104d4a	movq	%rdi, %rbx
0000000000104d4d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000104d52	leaq	0x915567(%rip), %rax
0000000000104d59	movq	%rax, (%rbx)
0000000000104d5c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000104d61	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000104d66	movq	%rax, %r14
0000000000104d69	movq	%rax, %rdi
0000000000104d6c	callq	__ZN19HgcSony709_800_MLUTC1Ev   ## HgcSony709_800_MLUT::HgcSony709_800_MLUT()
0000000000104d71	movq	%r14, 0x198(%rbx)
0000000000104d78	addq	$0x8, %rsp
0000000000104d7c	popq	%rbx
0000000000104d7d	popq	%r14
0000000000104d7f	popq	%r15
0000000000104d81	popq	%rbp
0000000000104d82	retq
0000000000104d83	movq	%rax, %r15
0000000000104d86	movq	%r14, %rdi
0000000000104d89	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000104d8e	movq	%rbx, %rdi
0000000000104d91	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104d96	movq	%r15, %rdi
0000000000104d99	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000104d9e	movq	%rax, %r15
0000000000104da1	movq	%rbx, %rdi
0000000000104da4	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104da9	movq	%r15, %rdi
0000000000104dac	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000104db1	nopw	%cs:(%rax,%rax)
__ZN18HGSony709_800_MLUTD2Ev:
0000000000104dc0	pushq	%rbp
0000000000104dc1	movq	%rsp, %rbp
0000000000104dc4	pushq	%rbx
0000000000104dc5	pushq	%rax
0000000000104dc6	leaq	0x9154f3(%rip), %rax
0000000000104dcd	movq	%rax, (%rdi)
0000000000104dd0	movq	0x198(%rdi), %rax
0000000000104dd7	testq	%rax, %rax
0000000000104dda	je	0x104deb
0000000000104ddc	movq	(%rax), %rcx
0000000000104ddf	movq	%rdi, %rbx
0000000000104de2	movq	%rax, %rdi
0000000000104de5	callq	*0x18(%rcx)
0000000000104de8	movq	%rbx, %rdi
0000000000104deb	addq	$0x8, %rsp
0000000000104def	popq	%rbx
0000000000104df0	popq	%rbp
0000000000104df1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104df6	movq	%rax, %rdi
0000000000104df9	callq	___clang_call_terminate
0000000000104dfe	nop
__ZN18HGSony709_800_MLUTD1Ev:
0000000000104e00	pushq	%rbp
0000000000104e01	movq	%rsp, %rbp
0000000000104e04	pushq	%rbx
0000000000104e05	pushq	%rax
0000000000104e06	leaq	0x9154b3(%rip), %rax
0000000000104e0d	movq	%rax, (%rdi)
0000000000104e10	movq	0x198(%rdi), %rax
0000000000104e17	testq	%rax, %rax
0000000000104e1a	je	0x104e2b
0000000000104e1c	movq	(%rax), %rcx
0000000000104e1f	movq	%rdi, %rbx
0000000000104e22	movq	%rax, %rdi
0000000000104e25	callq	*0x18(%rcx)
0000000000104e28	movq	%rbx, %rdi
0000000000104e2b	addq	$0x8, %rsp
0000000000104e2f	popq	%rbx
0000000000104e30	popq	%rbp
0000000000104e31	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104e36	movq	%rax, %rdi
0000000000104e39	callq	___clang_call_terminate
0000000000104e3e	nop
__ZN18HGSony709_800_MLUTD0Ev:
0000000000104e40	pushq	%rbp
0000000000104e41	movq	%rsp, %rbp
0000000000104e44	pushq	%rbx
0000000000104e45	pushq	%rax
0000000000104e46	movq	%rdi, %rbx
0000000000104e49	leaq	0x915470(%rip), %rax
0000000000104e50	movq	%rax, (%rdi)
0000000000104e53	movq	0x198(%rdi), %rdi
0000000000104e5a	testq	%rdi, %rdi
0000000000104e5d	je	0x104e65
0000000000104e5f	movq	(%rdi), %rax
0000000000104e62	callq	*0x18(%rax)
0000000000104e65	movq	%rbx, %rdi
0000000000104e68	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104e6d	movq	%rbx, %rdi
0000000000104e70	addq	$0x8, %rsp
0000000000104e74	popq	%rbx
0000000000104e75	popq	%rbp
0000000000104e76	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000104e7b	movq	%rax, %rdi
0000000000104e7e	callq	___clang_call_terminate
0000000000104e83	nopw	%cs:(%rax,%rax)
__ZN18HGSony709_800_MLUT9GetOutputEP10HGRenderer:
0000000000104e90	pushq	%rbp
0000000000104e91	movq	%rsp, %rbp
0000000000104e94	pushq	%r14
0000000000104e96	pushq	%rbx
0000000000104e97	movq	%rdi, %rbx
0000000000104e9a	movq	0x198(%rdi), %r14
0000000000104ea1	movq	%rsi, %rdi
0000000000104ea4	movq	%rbx, %rsi
0000000000104ea7	xorl	%edx, %edx
0000000000104ea9	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000104eae	movq	(%r14), %rcx
0000000000104eb1	movq	%r14, %rdi
0000000000104eb4	xorl	%esi, %esi
0000000000104eb6	movq	%rax, %rdx
0000000000104eb9	callq	*0x78(%rcx)
0000000000104ebc	movq	0x198(%rbx), %rdi
0000000000104ec3	movq	(%rdi), %rax
0000000000104ec6	movss	0x2cc19a(%rip), %xmm0
0000000000104ece	movss	0x2cc096(%rip), %xmm1
0000000000104ed6	movss	0x2cc18e(%rip), %xmm2
0000000000104ede	xorps	%xmm3, %xmm3
0000000000104ee1	xorl	%esi, %esi
0000000000104ee3	callq	*0x60(%rax)
0000000000104ee6	movq	0x198(%rbx), %rdi
0000000000104eed	movq	(%rdi), %rax
0000000000104ef0	movss	0x2cc094(%rip), %xmm0
0000000000104ef8	movss	0x2cc084(%rip), %xmm1
0000000000104f00	movss	0x2cc080(%rip), %xmm2
0000000000104f08	movss	0x2cc060(%rip), %xmm3
0000000000104f10	movl	$0x1, %esi
0000000000104f15	callq	*0x60(%rax)
0000000000104f18	movq	0x198(%rbx), %rdi
0000000000104f1f	movq	(%rdi), %rax
0000000000104f22	movss	0x2c5aaa(%rip), %xmm0
0000000000104f2a	movss	0x2cc13e(%rip), %xmm1
0000000000104f32	movss	0x2cc13a(%rip), %xmm2
0000000000104f3a	xorps	%xmm3, %xmm3
0000000000104f3d	movl	$0x2, %esi
0000000000104f42	callq	*0x60(%rax)
0000000000104f45	movq	0x198(%rbx), %rax
0000000000104f4c	popq	%rbx
0000000000104f4d	popq	%r14
0000000000104f4f	popq	%rbp
0000000000104f50	retq
0000000000104f51	nopw	%cs:(%rax,%rax)
__ZN13HGBT2390_EETFC2ENS_12MappingSpaceE:
0000000000104f60	pushq	%rbp
0000000000104f61	movq	%rsp, %rbp
0000000000104f64	pushq	%r15
0000000000104f66	pushq	%r14
0000000000104f68	pushq	%r12
0000000000104f6a	pushq	%rbx
0000000000104f6b	movl	%esi, %r14d
0000000000104f6e	movq	%rdi, %rbx
0000000000104f71	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000104f76	leaq	0x915583(%rip), %rax
0000000000104f7d	movq	%rax, (%rbx)
0000000000104f80	xorps	%xmm0, %xmm0
0000000000104f83	movups	%xmm0, 0x198(%rbx)
0000000000104f8a	movq	$0x0, 0x1a8(%rbx)
0000000000104f95	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000104f9a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000104f9f	movq	%rax, %r15
0000000000104fa2	movq	%rax, %rdi
0000000000104fa5	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000104faa	movq	%r15, 0x1b0(%rbx)
0000000000104fb1	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000104fb6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000104fbb	movq	%rax, %r15
0000000000104fbe	movq	%rax, %rdi
0000000000104fc1	callq	__ZN14HgcBT2390_EETFC1Ev        ## HgcBT2390_EETF::HgcBT2390_EETF()
0000000000104fc6	movq	%r15, 0x1b8(%rbx)
0000000000104fcd	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000104fd2	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000104fd7	movq	%rax, %r15
0000000000104fda	movq	%rax, %rdi
