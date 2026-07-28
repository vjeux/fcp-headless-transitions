__ZN10HGRGB_EETFC2Ev:
00000000001057e0	pushq	%rbp
00000000001057e1	movq	%rsp, %rbp
00000000001057e4	pushq	%r15
00000000001057e6	pushq	%r14
00000000001057e8	pushq	%r12
00000000001057ea	pushq	%rbx
00000000001057eb	movq	%rdi, %rbx
00000000001057ee	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001057f3	leaq	0x914f46(%rip), %rax
00000000001057fa	movq	%rax, (%rbx)
00000000001057fd	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000105802	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105807	movq	%rax, %r15
000000000010580a	movq	%rax, %rdi
000000000010580d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000105812	leaq	0x910de7(%rip), %rax
0000000000105819	movq	%rax, (%r15)
000000000010581c	movsd	0x2cb89c(%rip), %xmm0
0000000000105824	movsd	%xmm0, 0x1a0(%r15)
000000000010582d	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000105832	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105837	movq	%rax, %r12
000000000010583a	movq	%rax, %rdi
000000000010583d	callq	__ZN26HgcBT2100_PQ_OETF_qtApproxC1Ev ## HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox()
0000000000105842	movq	%r12, 0x198(%r15)
0000000000105849	movq	%r15, 0x198(%rbx)
0000000000105850	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000105855	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010585a	movq	%rax, %r15
000000000010585d	movq	%rax, %rdi
0000000000105860	callq	__ZN11HgcRGB_EETFC1Ev           ## HgcRGB_EETF::HgcRGB_EETF()
0000000000105865	movq	%r15, 0x1a0(%rbx)
000000000010586c	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000105871	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105876	movq	%rax, %r15
0000000000105879	movq	%rax, %rdi
000000000010587c	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000105881	leaq	0x910fb8(%rip), %rax
0000000000105888	movq	%rax, (%r15)
000000000010588b	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000105890	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105895	movq	%rax, %r12
0000000000105898	movq	%rax, %rdi
000000000010589b	callq	__ZN33HgcBT2100_PQ_InverseOETF_qtApproxC1Ev ## HgcBT2100_PQ_InverseOETF_qtApprox::HgcBT2100_PQ_InverseOETF_qtApprox()
00000000001058a0	movq	%r12, 0x198(%r15)
00000000001058a7	movaps	0x2cb952(%rip), %xmm0
00000000001058ae	movaps	%xmm0, 0x1a0(%r15)
00000000001058b6	movq	%r15, 0x1a8(%rbx)
00000000001058bd	movaps	0x2cb94c(%rip), %xmm0
00000000001058c4	movaps	%xmm0, 0x1b0(%rbx)
00000000001058cb	movsd	0x2c471d(%rip), %xmm0
00000000001058d3	movsd	%xmm0, 0x1c0(%rbx)
00000000001058db	popq	%rbx
00000000001058dc	popq	%r12
00000000001058de	popq	%r14
00000000001058e0	popq	%r15
00000000001058e2	popq	%rbp
00000000001058e3	retq
00000000001058e4	jmp	0x1058ec
00000000001058e6	jmp	0x1058f9
00000000001058e8	jmp	0x105906
00000000001058ea	jmp	0x105906
00000000001058ec	movq	%rax, %r14
00000000001058ef	movq	%r12, %rdi
00000000001058f2	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001058f7	jmp	0x1058fc
00000000001058f9	movq	%rax, %r14
00000000001058fc	movq	%r15, %rdi
00000000001058ff	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000105904	jmp	0x105909
0000000000105906	movq	%rax, %r14
0000000000105909	movq	%r15, %rdi
000000000010590c	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000105911	movq	%rbx, %rdi
0000000000105914	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000105919	movq	%r14, %rdi
000000000010591c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000105921	movq	%rax, %r14
0000000000105924	movq	%rbx, %rdi
0000000000105927	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000010592c	movq	%r14, %rdi
000000000010592f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000105934	nopw	%cs:(%rax,%rax)
