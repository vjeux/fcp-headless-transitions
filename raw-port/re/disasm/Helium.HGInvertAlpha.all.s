__ZN13HGInvertAlphaC2Ev:
00000000000036e0	pushq	%rbp
00000000000036e1	movq	%rsp, %rbp
00000000000036e4	pushq	%r15
00000000000036e6	pushq	%r14
00000000000036e8	pushq	%rbx
00000000000036e9	pushq	%rax
00000000000036ea	movq	%rdi, %rbx
00000000000036ed	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000036f2	leaq	0x9fefff(%rip), %rax
00000000000036f9	movq	%rax, (%rbx)
00000000000036fc	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000003701	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000003706	movq	%rax, %r14
0000000000003709	movq	%rax, %rdi
000000000000370c	callq	__ZN14HgcInvertAlphaC1Ev        ## HgcInvertAlpha::HgcInvertAlpha()
0000000000003711	movq	%r14, 0x198(%rbx)
0000000000003718	addq	$0x8, %rsp
000000000000371c	popq	%rbx
000000000000371d	popq	%r14
000000000000371f	popq	%r15
0000000000003721	popq	%rbp
0000000000003722	retq
0000000000003723	movq	%rax, %r15
0000000000003726	movq	%r14, %rdi
0000000000003729	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000000372e	movq	%rbx, %rdi
0000000000003731	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000003736	movq	%r15, %rdi
0000000000003739	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000000373e	movq	%rax, %r15
0000000000003741	movq	%rbx, %rdi
0000000000003744	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000003749	movq	%r15, %rdi
000000000000374c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000003751	nopw	%cs:(%rax,%rax)
__ZN13HGInvertAlphaC1Ev:
0000000000003760	pushq	%rbp
0000000000003761	movq	%rsp, %rbp
0000000000003764	pushq	%r15
0000000000003766	pushq	%r14
0000000000003768	pushq	%rbx
0000000000003769	pushq	%rax
000000000000376a	movq	%rdi, %rbx
000000000000376d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000003772	leaq	0x9fef7f(%rip), %rax
0000000000003779	movq	%rax, (%rbx)
000000000000377c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000003781	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000003786	movq	%rax, %r14
0000000000003789	movq	%rax, %rdi
000000000000378c	callq	__ZN14HgcInvertAlphaC1Ev        ## HgcInvertAlpha::HgcInvertAlpha()
0000000000003791	movq	%r14, 0x198(%rbx)
0000000000003798	addq	$0x8, %rsp
000000000000379c	popq	%rbx
000000000000379d	popq	%r14
000000000000379f	popq	%r15
00000000000037a1	popq	%rbp
00000000000037a2	retq
00000000000037a3	movq	%rax, %r15
00000000000037a6	movq	%r14, %rdi
00000000000037a9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000037ae	movq	%rbx, %rdi
00000000000037b1	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000037b6	movq	%r15, %rdi
00000000000037b9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000037be	movq	%rax, %r15
00000000000037c1	movq	%rbx, %rdi
00000000000037c4	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000037c9	movq	%r15, %rdi
00000000000037cc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000037d1	nopw	%cs:(%rax,%rax)
__ZN13HGInvertAlphaD2Ev:
00000000000037e0	pushq	%rbp
00000000000037e1	movq	%rsp, %rbp
00000000000037e4	pushq	%rbx
00000000000037e5	pushq	%rax
00000000000037e6	movq	%rdi, %rbx
00000000000037e9	leaq	0x9fef08(%rip), %rax
00000000000037f0	movq	%rax, (%rdi)
00000000000037f3	movq	0x198(%rdi), %rdi
00000000000037fa	movq	(%rdi), %rax
00000000000037fd	callq	*0x18(%rax)
0000000000003800	movq	%rbx, %rdi
0000000000003803	addq	$0x8, %rsp
0000000000003807	popq	%rbx
0000000000003808	popq	%rbp
0000000000003809	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000000380e	movq	%rax, %rdi
0000000000003811	callq	___clang_call_terminate
0000000000003816	nopw	%cs:(%rax,%rax)
__ZN13HGInvertAlphaD1Ev:
0000000000003820	pushq	%rbp
0000000000003821	movq	%rsp, %rbp
0000000000003824	pushq	%rbx
0000000000003825	pushq	%rax
0000000000003826	movq	%rdi, %rbx
0000000000003829	leaq	0x9feec8(%rip), %rax
0000000000003830	movq	%rax, (%rdi)
0000000000003833	movq	0x198(%rdi), %rdi
000000000000383a	movq	(%rdi), %rax
000000000000383d	callq	*0x18(%rax)
0000000000003840	movq	%rbx, %rdi
0000000000003843	addq	$0x8, %rsp
0000000000003847	popq	%rbx
0000000000003848	popq	%rbp
0000000000003849	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000000384e	movq	%rax, %rdi
0000000000003851	callq	___clang_call_terminate
0000000000003856	nopw	%cs:(%rax,%rax)
__ZN13HGInvertAlphaD0Ev:
0000000000003860	pushq	%rbp
0000000000003861	movq	%rsp, %rbp
0000000000003864	pushq	%rbx
0000000000003865	pushq	%rax
0000000000003866	movq	%rdi, %rbx
0000000000003869	leaq	0x9fee88(%rip), %rax
0000000000003870	movq	%rax, (%rdi)
0000000000003873	movq	0x198(%rdi), %rdi
000000000000387a	movq	(%rdi), %rax
000000000000387d	callq	*0x18(%rax)
0000000000003880	movq	%rbx, %rdi
0000000000003883	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000003888	movq	%rbx, %rdi
000000000000388b	addq	$0x8, %rsp
000000000000388f	popq	%rbx
0000000000003890	popq	%rbp
0000000000003891	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000003896	movq	%rax, %rdi
0000000000003899	callq	___clang_call_terminate
000000000000389e	nop
__ZN13HGInvertAlpha9GetOutputEP10HGRenderer:
00000000000038a0	pushq	%rbp
00000000000038a1	movq	%rsp, %rbp
00000000000038a4	pushq	%r14
00000000000038a6	pushq	%rbx
00000000000038a7	movq	%rdi, %rbx
00000000000038aa	movq	(%rdi), %rax
00000000000038ad	movq	0x198(%rdi), %r14
00000000000038b4	xorl	%esi, %esi
00000000000038b6	callq	*0x80(%rax)
00000000000038bc	movq	(%r14), %rcx
00000000000038bf	movq	%r14, %rdi
00000000000038c2	xorl	%esi, %esi
00000000000038c4	movq	%rax, %rdx
00000000000038c7	callq	*0x78(%rcx)
