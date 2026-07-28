__ZN14HGRenderCinemaC2ENS_6FXTypeE:
00000000000f32e0	pushq	%rbp
00000000000f32e1	movq	%rsp, %rbp
00000000000f32e4	pushq	%r15
00000000000f32e6	pushq	%r14
00000000000f32e8	pushq	%rbx
00000000000f32e9	pushq	%rax
00000000000f32ea	movl	%esi, %r14d
00000000000f32ed	movq	%rdi, %rbx
00000000000f32f0	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000f32f5	leaq	0x91eedc(%rip), %rax
00000000000f32fc	movq	%rax, (%rbx)
00000000000f32ff	movq	$0x0, 0x198(%rbx)
00000000000f330a	movl	%r14d, 0x1a0(%rbx)
00000000000f3311	testl	%r14d, %r14d
00000000000f3314	je	0xf3352
00000000000f3316	leaq	0x7f3c52(%rip), %rdi            ## literal pool for: "HGRenderCinema : Render FX Type not specified in initialization of node."
00000000000f331d	xorl	%eax, %eax
00000000000f331f	callq	__ZN8HGLogger5errorEPKcz        ## HGLogger::error(char const*, ...)
00000000000f3324	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f3329	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f332e	movq	%rax, %r14
00000000000f3331	movq	%rax, %rdi
00000000000f3334	callq	__ZN11HGCinematicC1Ev           ## HGCinematic::HGCinematic()
00000000000f3339	movq	0x198(%rbx), %rdi
00000000000f3340	cmpq	%r14, %rdi
00000000000f3343	je	0xf3390
00000000000f3345	testq	%rdi, %rdi
00000000000f3348	je	0xf337e
00000000000f334a	movq	(%rdi), %rax
00000000000f334d	callq	*0x18(%rax)
00000000000f3350	jmp	0xf337e
00000000000f3352	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000000f3357	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f335c	movq	%rax, %r14
00000000000f335f	movq	%rax, %rdi
00000000000f3362	callq	__ZN11HGCinematicC1Ev           ## HGCinematic::HGCinematic()
00000000000f3367	movq	0x198(%rbx), %rdi
00000000000f336e	cmpq	%r14, %rdi
00000000000f3371	je	0xf33a0
00000000000f3373	testq	%rdi, %rdi
00000000000f3376	je	0xf337e
00000000000f3378	movq	(%rdi), %rax
00000000000f337b	callq	*0x18(%rax)
00000000000f337e	movq	%r14, 0x198(%rbx)
00000000000f3385	addq	$0x8, %rsp
00000000000f3389	popq	%rbx
00000000000f338a	popq	%r14
00000000000f338c	popq	%r15
00000000000f338e	popq	%rbp
00000000000f338f	retq
00000000000f3390	testq	%r14, %r14
00000000000f3393	je	0xf3385
00000000000f3395	movq	(%r14), %rax
00000000000f3398	movq	%r14, %rdi
00000000000f339b	callq	*0x18(%rax)
00000000000f339e	jmp	0xf3385
00000000000f33a0	testq	%r14, %r14
00000000000f33a3	je	0xf3385
00000000000f33a5	movq	(%r14), %rax
00000000000f33a8	movq	%r14, %rdi
00000000000f33ab	callq	*0x18(%rax)
00000000000f33ae	jmp	0xf3385
00000000000f33b0	movq	%rax, %rdi
00000000000f33b3	callq	___clang_call_terminate
00000000000f33b8	movq	%rax, %rdi
00000000000f33bb	callq	___clang_call_terminate
00000000000f33c0	movq	%rax, %r15
00000000000f33c3	testq	%r14, %r14
00000000000f33c6	je	0xf340c
00000000000f33c8	movq	(%r14), %rax
00000000000f33cb	movq	%r14, %rdi
00000000000f33ce	callq	*0x18(%rax)
00000000000f33d1	jmp	0xf340c
00000000000f33d3	movq	%rax, %rdi
00000000000f33d6	callq	___clang_call_terminate
00000000000f33db	movq	%rax, %r15
00000000000f33de	testq	%r14, %r14
00000000000f33e1	je	0xf340c
00000000000f33e3	movq	(%r14), %rax
00000000000f33e6	movq	%r14, %rdi
00000000000f33e9	callq	*0x18(%rax)
00000000000f33ec	jmp	0xf340c
00000000000f33ee	movq	%rax, %rdi
00000000000f33f1	callq	___clang_call_terminate
00000000000f33f6	jmp	0xf33fa
00000000000f33f8	jmp	0xf3409
00000000000f33fa	movq	%rax, %r15
00000000000f33fd	movq	%r14, %rdi
00000000000f3400	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f3405	jmp	0xf340c
00000000000f3407	jmp	0xf3409
00000000000f3409	movq	%rax, %r15
00000000000f340c	movq	0x198(%rbx), %rdi
00000000000f3413	testq	%rdi, %rdi
00000000000f3416	je	0xf341e
00000000000f3418	movq	(%rdi), %rax
00000000000f341b	callq	*0x18(%rax)
00000000000f341e	movq	%rbx, %rdi
00000000000f3421	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000f3426	movq	%r15, %rdi
00000000000f3429	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f342e	movq	%rax, %rdi
00000000000f3431	callq	___clang_call_terminate
00000000000f3436	nopw	%cs:(%rax,%rax)
