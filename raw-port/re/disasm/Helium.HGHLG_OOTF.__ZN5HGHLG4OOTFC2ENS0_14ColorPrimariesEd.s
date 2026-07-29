__ZN5HGHLG4OOTFC2ENS0_14ColorPrimariesEd:
00000000000fffe0	pushq	%rbp
00000000000fffe1	movq	%rsp, %rbp
00000000000fffe4	pushq	%r15
00000000000fffe6	pushq	%r14
00000000000fffe8	pushq	%rbx
00000000000fffe9	pushq	%rax
00000000000fffea	movsd	%xmm0, -0x20(%rbp)
00000000000fffef	movl	%esi, %r14d
00000000000ffff2	movq	%rdi, %rbx
00000000000ffff5	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000ffffa	leaq	0x91737f(%rip), %rax
0000000000100001	movq	%rax, (%rbx)
0000000000100004	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000100009	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010000e	movq	%rax, %r15
0000000000100011	movq	%rax, %rdi
0000000000100014	callq	__ZN30HgcBT2100_HLG_OOTF_InverseOOTFC1Ev ## HgcBT2100_HLG_OOTF_InverseOOTF::HgcBT2100_HLG_OOTF_InverseOOTF()
0000000000100019	movq	%r15, 0x198(%rbx)
0000000000100020	movl	%r14d, %eax
0000000000100023	leaq	(%rax,%rax,2), %rax
0000000000100027	leaq	__ZN5HGHLG4OOTF15luminanceCoeffsE(%rip), %rcx ## HGHLG::OOTF::luminanceCoeffs
000000000010002e	leaq	(%rcx,%rax,4), %rax
0000000000100032	movq	%rax, 0x1a0(%rbx)
0000000000100039	movsd	-0x20(%rbp), %xmm1
000000000010003e	movsd	%xmm1, 0x1a8(%rbx)
0000000000100046	movl	$0x3e4ccccd, 0x1b0(%rbx)        ## imm = 0x3E4CCCCD
0000000000100050	movsd	0x2d0d88(%rip), %xmm0
0000000000100058	divsd	%xmm1, %xmm0
000000000010005c	cvtsd2ss	%xmm0, %xmm0
0000000000100060	movss	%xmm0, 0x1b4(%rbx)
0000000000100068	addq	$0x8, %rsp
000000000010006c	popq	%rbx
000000000010006d	popq	%r14
000000000010006f	popq	%r15
0000000000100071	popq	%rbp
0000000000100072	retq
0000000000100073	movq	%rax, %r14
0000000000100076	movq	%r15, %rdi
0000000000100079	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010007e	movq	%rbx, %rdi
0000000000100081	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000100086	movq	%r14, %rdi
0000000000100089	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000010008e	movq	%rax, %r14
0000000000100091	movq	%rbx, %rdi
0000000000100094	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000100099	movq	%r14, %rdi
000000000010009c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001000a1	nopw	%cs:(%rax,%rax)
