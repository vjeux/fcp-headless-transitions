__ZN5HGHLG4OOTFC1ENS0_14ColorPrimariesEd:
0000000000100170	pushq	%rbp
0000000000100171	movq	%rsp, %rbp
0000000000100174	pushq	%r15
0000000000100176	pushq	%r14
0000000000100178	pushq	%rbx
0000000000100179	pushq	%rax
000000000010017a	movsd	%xmm0, -0x20(%rbp)
000000000010017f	movl	%esi, %r14d
0000000000100182	movq	%rdi, %rbx
0000000000100185	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000010018a	leaq	0x9171ef(%rip), %rax
0000000000100191	movq	%rax, (%rbx)
0000000000100194	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000100199	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010019e	movq	%rax, %r15
00000000001001a1	movq	%rax, %rdi
00000000001001a4	callq	__ZN30HgcBT2100_HLG_OOTF_InverseOOTFC1Ev ## HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
00000000001001a9	movq	%r15, 0x198(%rbx)
00000000001001b0	movl	%r14d, %eax
00000000001001b3	leaq	(%rax,%rax,2), %rax
00000000001001b7	leaq	__ZN5HGHLG4OOTF15luminanceCoeffsE(%rip), %rcx ## HGHLG::OOTF::luminanceCoeffs
00000000001001be	leaq	(%rcx,%rax,4), %rax
00000000001001c2	movq	%rax, 0x1a0(%rbx)
00000000001001c9	movsd	-0x20(%rbp), %xmm1
00000000001001ce	movsd	%xmm1, 0x1a8(%rbx)
00000000001001d6	movl	$0x3e4ccccd, 0x1b0(%rbx)        ## imm = 0x3E4CCCCD
00000000001001e0	movsd	0x2d0bf8(%rip), %xmm0
00000000001001e8	divsd	%xmm1, %xmm0
00000000001001ec	cvtsd2ss	%xmm0, %xmm0
00000000001001f0	movss	%xmm0, 0x1b4(%rbx)
00000000001001f8	addq	$0x8, %rsp
00000000001001fc	popq	%rbx
00000000001001fd	popq	%r14
00000000001001ff	popq	%r15
0000000000100201	popq	%rbp
0000000000100202	retq
0000000000100203	movq	%rax, %r14
0000000000100206	movq	%r15, %rdi
0000000000100209	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010020e	movq	%rbx, %rdi
0000000000100211	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000100216	movq	%r14, %rdi
0000000000100219	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000010021e	movq	%rax, %r14
0000000000100221	movq	%rbx, %rdi
0000000000100224	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000100229	movq	%r14, %rdi
000000000010022c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000100231	nopw	%cs:(%rax,%rax)
