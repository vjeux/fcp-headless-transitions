__ZN30FFAudioBufferListLocklessQueueC1ENS_10SortOptionE:
00000000012567b0	pushq	%rbp
00000000012567b1	movq	%rsp, %rbp
00000000012567b4	pushq	%r14
00000000012567b6	pushq	%rbx
00000000012567b7	movl	%esi, %r14d
00000000012567ba	movq	%rdi, %rbx
00000000012567bd	xorl	%esi, %esi
00000000012567bf	testl	%r14d, %r14d
00000000012567c2	setne	%sil
00000000012567c6	callq	__ZN19FFLocklessQueueBaseC2E25FFLocklessQueueSortOption ## FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption)
00000000012567cb	leaq	0x6cb0a6(%rip), %rax
00000000012567d2	movq	%rax, (%rbx)
00000000012567d5	movl	%r14d, 0x38(%rbx)
00000000012567d9	leaq	__ZL42FFAudioBufferListLocklessQueue_FreeElementPvPN19FFLocklessQueueBase11ElementBaseE(%rip), %rsi ## FFAudioBufferListLocklessQueue_FreeElement(void*, FFLocklessQueueBase::ElementBase*)
00000000012567e0	movq	%rbx, %rdi
00000000012567e3	xorl	%edx, %edx
00000000012567e5	callq	__ZN19FFLocklessQueueBase18setFreeElementProcEPFvPvPNS_11ElementBaseEES0_ ## FFLocklessQueueBase::setFreeElementProc(void (*)(void*, FFLocklessQueueBase::ElementBase*), void*)
00000000012567ea	popq	%rbx
00000000012567eb	popq	%r14
00000000012567ed	popq	%rbp
00000000012567ee	retq
00000000012567ef	movq	%rax, %r14
00000000012567f2	movq	%rbx, %rdi
00000000012567f5	callq	__ZN15FFLocklessQueueIP17FFAudioBufferListED2Ev ## FFLocklessQueue<FFAudioBufferList*>::~FFLocklessQueue()
00000000012567fa	movq	%r14, %rdi
00000000012567fd	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001256802	nopw	%cs:(%rax,%rax)
