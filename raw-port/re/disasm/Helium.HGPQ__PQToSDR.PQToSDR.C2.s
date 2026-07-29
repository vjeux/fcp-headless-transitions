__ZN4HGPQ7PQToSDRC2ENS0_10OutputModeE:
00000000000fed40	pushq	%rbp
00000000000fed41	movq	%rsp, %rbp
00000000000fed44	pushq	%r15
00000000000fed46	pushq	%r14
00000000000fed48	pushq	%r12
00000000000fed4a	pushq	%rbx
00000000000fed4b	movl	%esi, %r14d
00000000000fed4e	movq	%rdi, %rbx
00000000000fed51	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fed56	leaq	0x917d23(%rip), %rax
00000000000fed5d	movq	%rax, (%rbx)
00000000000fed60	movq	$0x0, 0x198(%rbx)
00000000000fed6b	movl	%r14d, 0x1a0(%rbx)
00000000000fed72	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000000fed77	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fed7c	movq	%rax, %r15
00000000000fed7f	movq	%rax, %rdi
00000000000fed82	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fed87	leaq	0x9171b2(%rip), %rax
00000000000fed8e	movq	%rax, (%r15)
00000000000fed91	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fed96	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fed9b	movq	%rax, %r12
00000000000fed9e	movq	%rax, %rdi
00000000000feda1	callq	__ZN21HgcST2084_InverseEOTFC1Ev ## HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()
00000000000feda6	movq	%r12, 0x198(%r15)
00000000000fedad	movsd	0x2d230b(%rip), %xmm0
00000000000fedb5	movsd	%xmm0, 0x1a0(%r15)
00000000000fedbe	movq	%r15, 0x1c0(%rbx)
00000000000fedc5	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000000fedca	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fedcf	movq	%rax, %r15
00000000000fedd2	movq	%rax, %rdi
00000000000fedd5	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fedda	leaq	0x916f1f(%rip), %rax
00000000000fede1	movq	%rax, (%r15)
00000000000fede4	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fede9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fedee	movq	%rax, %r12
00000000000fedf1	movq	%rax, %rdi
00000000000fedf4	callq	__ZN14HgcST2084_EOTFC1Ev        ## HgcST2084_EOTF::HgcST2084_EOTF()
00000000000fedf9	movq	%r12, 0x198(%r15)
00000000000fee00	movl	$0x42c80000, 0x1a0(%r15)        ## imm = 0x42C80000
00000000000fee0b	movq	%r15, 0x1c8(%rbx)
00000000000fee12	movabsq	$0x4069600000000000, %rax       ## imm = 0x4069600000000000
00000000000fee1c	movq	%rax, 0x1b8(%rbx)
00000000000fee23	movaps	0x2d22a6(%rip), %xmm0
00000000000fee2a	movups	%xmm0, 0x1a8(%rbx)
00000000000fee31	movaps	0x2d22a8(%rip), %xmm0
00000000000fee38	movaps	%xmm0, 0x1d0(%rbx)
00000000000fee3f	movsd	0x2d22a9(%rip), %xmm0
00000000000fee47	movsd	%xmm0, 0x1e0(%rbx)
00000000000fee4f	popq	%rbx
00000000000fee50	popq	%r12
00000000000fee52	popq	%r14
00000000000fee54	popq	%r15
00000000000fee56	popq	%rbp
00000000000fee57	retq
00000000000fee58	jmp	0xfee5e
00000000000fee5a	jmp	0xfee6b
00000000000fee5c	jmp	0xfee78
00000000000fee5e	movq	%rax, %r14
00000000000fee61	movq	%r12, %rdi
00000000000fee64	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fee69	jmp	0xfee6e
00000000000fee6b	movq	%rax, %r14
00000000000fee6e	movq	%r15, %rdi
00000000000fee71	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fee76	jmp	0xfee7b
00000000000fee78	movq	%rax, %r14
00000000000fee7b	movq	%r15, %rdi
00000000000fee7e	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fee83	movq	%rbx, %rdi
00000000000fee86	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fee8b	movq	%r14, %rdi
00000000000fee8e	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fee93	movq	%rax, %r14
00000000000fee96	movq	%rbx, %rdi
00000000000fee99	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fee9e	movq	%r14, %rdi
00000000000feea1	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000feea6	nopw	%cs:(%rax,%rax)
