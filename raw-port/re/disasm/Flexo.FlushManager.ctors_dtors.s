=== __ZN12FlushManagerC1Ev ===
__ZN12FlushManagerC1Ev:
0000000000ab66c0	pushq	%rbp
0000000000ab66c1	movq	%rsp, %rbp
0000000000ab66c4	movq	$0x32aaaba7, (%rdi)             ## imm = 0x32AAABA7
0000000000ab66cb	xorps	%xmm0, %xmm0
0000000000ab66ce	movups	%xmm0, 0x8(%rdi)
0000000000ab66d2	movups	%xmm0, 0x18(%rdi)
0000000000ab66d6	movups	%xmm0, 0x28(%rdi)
0000000000ab66da	movups	%xmm0, 0x38(%rdi)
0000000000ab66de	movups	%xmm0, 0x48(%rdi)
0000000000ab66e2	popq	%rbp
0000000000ab66e3	retq
0000000000ab66e4	nopw	%cs:(%rax,%rax)
=== __ZN12FlushManagerC2Ev ===
=== __ZN12FlushManagerD1Ev ===
__ZN12FlushManagerD1Ev:
0000000000ab6840	pushq	%rbp
0000000000ab6841	movq	%rsp, %rbp
0000000000ab6844	popq	%rbp
0000000000ab6845	jmp	__ZN12FlushManagerD2Ev          ## FlushManager::~FlushManager()
0000000000ab684a	nopw	(%rax,%rax)
=== __ZN12FlushManagerD2Ev ===
__ZN12FlushManagerD2Ev:
0000000000ab66f0	pushq	%rbp
0000000000ab66f1	movq	%rsp, %rbp
0000000000ab66f4	pushq	%r15
0000000000ab66f6	pushq	%r14
0000000000ab66f8	pushq	%r13
0000000000ab66fa	pushq	%r12
0000000000ab66fc	pushq	%rbx
0000000000ab66fd	subq	$0x28, %rsp
0000000000ab6701	movq	%rdi, %r14
0000000000ab6704	movq	0xe36c95(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAutoreleasePool
0000000000ab670b	callq	0x1497998                       ## symbol stub for: _objc_opt_new
0000000000ab6710	movq	%rax, -0x38(%rbp)
0000000000ab6714	movq	0x48(%r14), %rbx
0000000000ab6718	movq	%r14, -0x30(%rbp)
0000000000ab671c	cmpq	%rbx, 0x40(%r14)
0000000000ab6720	je	0xab67ed
0000000000ab6726	movq	0x1119eb3(%rip), %rax
0000000000ab672d	movq	%rax, -0x50(%rbp)
0000000000ab6731	movq	0x1131ab8(%rip), %rax
0000000000ab6738	movq	%rax, -0x48(%rbp)
0000000000ab673c	movq	0x1131ab5(%rip), %rax
0000000000ab6743	movq	%rax, -0x40(%rbp)
0000000000ab6747	nopw	(%rax,%rax)
0000000000ab6750	cmpq	$0x0, -0x40(%rbx)
0000000000ab6755	je	0xab67b2
0000000000ab6757	movq	-0x38(%rbx), %r14
0000000000ab675b	movq	-0x10(%rbx), %r15
0000000000ab675f	movq	%r15, %rdi
0000000000ab6762	movq	-0x50(%rbp), %rsi
0000000000ab6766	callq	*0xe36f54(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab676c	testq	%r14, %r14
0000000000ab676f	je	0xab67a8
0000000000ab6771	movq	%rax, %r12
0000000000ab6774	movq	%rdx, %r13
0000000000ab6777	movq	%rdx, %rax
0000000000ab677a	orq	%r12, %rax
0000000000ab677d	je	0xab67a8
0000000000ab677f	movq	%r15, %rdi
0000000000ab6782	movq	-0x48(%rbp), %rsi
0000000000ab6786	callq	*0xe36f34(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab678c	xorl	%r8d, %r8d
0000000000ab678f	testb	$0x2, %al
0000000000ab6791	sete	%r8b
0000000000ab6795	movq	%r14, %rdi
0000000000ab6798	movq	-0x40(%rbp), %rsi
0000000000ab679c	movq	%r12, %rdx
0000000000ab679f	movq	%r13, %rcx
0000000000ab67a2	callq	*0xe36f18(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab67a8	movq	-0x40(%rbx), %rdi
0000000000ab67ac	callq	*0xe36f56(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab67b2	movq	-0x38(%rbx), %rdi
0000000000ab67b6	callq	*0xe36f4c(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab67bc	movq	-0x30(%rbx), %rdi
0000000000ab67c0	callq	*0xe36f42(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab67c6	movq	-0x10(%rbx), %rdi
0000000000ab67ca	callq	*0xe36f38(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab67d0	movq	-0x30(%rbp), %rcx
0000000000ab67d4	movq	0x40(%rcx), %rax
0000000000ab67d8	movq	0x48(%rcx), %rbx
0000000000ab67dc	addq	$-0x40, %rbx
0000000000ab67e0	movq	%rbx, 0x48(%rcx)
0000000000ab67e4	cmpq	%rbx, %rax
0000000000ab67e7	jne	0xab6750
0000000000ab67ed	movq	-0x38(%rbp), %rdi
0000000000ab67f1	callq	*0xe36f11(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab67f7	movq	-0x30(%rbp), %rbx
0000000000ab67fb	movq	0x40(%rbx), %rdi
0000000000ab67ff	testq	%rdi, %rdi
0000000000ab6802	je	0xab680d
0000000000ab6804	movq	%rdi, 0x48(%rbx)
0000000000ab6808	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000ab680d	movq	%rbx, %rdi
0000000000ab6810	addq	$0x28, %rsp
0000000000ab6814	popq	%rbx
0000000000ab6815	popq	%r12
0000000000ab6817	popq	%r13
0000000000ab6819	popq	%r14
0000000000ab681b	popq	%r15
0000000000ab681d	popq	%rbp
0000000000ab681e	jmp	0x14973bc                       ## symbol stub for: __ZNSt3__15mutexD1Ev
0000000000ab6823	movq	%rax, %rdi
0000000000ab6826	callq	___clang_call_terminate
0000000000ab682b	movq	%rax, %rdi
0000000000ab682e	callq	___clang_call_terminate
0000000000ab6833	nopw	%cs:(%rax,%rax)
